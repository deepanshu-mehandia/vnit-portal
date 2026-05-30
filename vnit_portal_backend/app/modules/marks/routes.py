from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from app.database.connection import get_connection, release_connection
from app.core.dependencies import get_current_user
from collections import OrderedDict
import traceback

router = APIRouter(prefix="/marks", tags=["Marks"])

EXAM_MAX = {"UT1": 30, "UT2": 30, "Assignment": 20, "End Sem": 60, "Lab": 50}

GRADE_SCALE = [
    (90, "O",  10),
    (80, "AB", 9),
    (70, "BB", 8),
    (60, "BC", 7),
    (50, "CC", 6),
    (45, "CD", 5),
    (40, "DD", 4),
    (0,  "FF", 0),
]


def marks_to_grade(total: float, max_total: float):
    if max_total == 0:
        return None, None
    pct = (total / max_total) * 100
    for threshold, grade, points in GRADE_SCALE:
        if pct >= threshold:
            return grade, points
    return "FF", 0


class SingleMark(BaseModel):
    student_id: int
    marks: int


class BulkMarksRequest(BaseModel):
    offering_id: int
    exam_type: str
    entries: List[SingleMark]


# ── Faculty: enter / update marks ──────────────────────────────
@router.post("/enter")
def enter_marks(data: BulkMarksRequest, user=Depends(get_current_user)):
    if user["role"] != "faculty":
        raise HTTPException(403, "Faculty only")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],))
        fac = cur.fetchone()
        if not fac:
            raise HTTPException(403, "Not a faculty member")

        cur.execute("""
            SELECT 1 FROM course_offerings
            WHERE offering_id = %s AND faculty_id = %s
        """, (data.offering_id, fac[0]))
        if not cur.fetchone():
            raise HTTPException(403, "This course does not belong to you")

        max_marks = EXAM_MAX.get(data.exam_type, 100)

        for entry in data.entries:
            if entry.marks < 0 or entry.marks > max_marks:
                raise HTTPException(400, f"Marks must be between 0 and {max_marks}")

            cur.execute("""
                SELECT id FROM marks
                WHERE student_id = %s AND offering_id = %s AND exam_type = %s
            """, (entry.student_id, data.offering_id, data.exam_type))
            existing = cur.fetchone()

            if existing:
                cur.execute("UPDATE marks SET marks = %s WHERE id = %s",
                            (entry.marks, existing[0]))
            else:
                cur.execute("""
                    INSERT INTO marks (student_id, offering_id, exam_type, marks)
                    VALUES (%s, %s, %s, %s)
                """, (entry.student_id, data.offering_id, data.exam_type, entry.marks))

        conn.commit()
        return {"message": "Marks saved successfully"}

    except HTTPException:
        raise
    except Exception:
        conn.rollback()
        print("ERROR /marks/enter:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Faculty: view marks for a course ───────────────────────────
@router.get("/course/{offering_id}")
def get_course_marks(offering_id: int, user=Depends(get_current_user)):
    if user["role"] != "faculty":
        raise HTTPException(403, "Faculty only")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],))
        fac = cur.fetchone()
        if not fac:
            raise HTTPException(403, "Not a faculty member")

        cur.execute("""
            SELECT 1 FROM course_offerings
            WHERE offering_id = %s AND faculty_id = %s
        """, (offering_id, fac[0]))
        if not cur.fetchone():
            raise HTTPException(403, "This course does not belong to you")

        cur.execute("""
            SELECT s.student_id, s.first_name, s.last_name, s.roll_number,
                   m.exam_type, m.marks
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            LEFT JOIN marks m
                ON m.student_id = s.student_id AND m.offering_id = r.offering_id
            WHERE r.offering_id = %s
            ORDER BY s.first_name, m.exam_type
        """, (offering_id,))

        rows = cur.fetchall()
        students: dict = {}
        for row in rows:
            sid = row[0]
            if sid not in students:
                students[sid] = {
                    "student_id":  row[0],
                    "name":        f"{row[1] or ''} {row[2] or ''}".strip(),
                    "roll_number": row[3],
                    "marks":       {},
                }
            if row[4]:
                students[sid]["marks"][row[4]] = row[5]

        return list(students.values())

    except HTTPException:
        raise
    except Exception:
        print("ERROR /marks/course:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Student: view own marks ────────────────────────────────────
@router.get("/student")
def get_student_marks(user=Depends(get_current_user)):
    if user["role"] != "student":
        raise HTTPException(403, "Students only")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT student_id FROM students WHERE user_id = %s", (user["user_id"],))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Student not found")
        student_id = row[0]

        cur.execute("""
            SELECT c.course_code, c.course_name, c.semester,
                   m.exam_type, m.marks,
                   f.name AS faculty_name
            FROM marks m
            JOIN course_offerings co ON m.offering_id = co.offering_id
            JOIN courses c  ON co.course_id  = c.course_id
            JOIN faculty f  ON co.faculty_id = f.faculty_id
            WHERE m.student_id = %s
            ORDER BY c.course_code, m.exam_type
        """, (student_id,))

        rows = cur.fetchall()
        courses: dict = {}
        for row in rows:
            code = row[0]
            if code not in courses:
                courses[code] = {
                    "course_code": row[0],
                    "course_name": row[1],
                    "semester":    row[2],
                    "faculty":     row[5],
                    "marks":       {},
                }
            courses[code]["marks"][row[3]] = row[4]

        return list(courses.values())

    except HTTPException:
        raise
    except Exception:
        print("ERROR /marks/student:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Student: grade card ────────────────────────────────────────
@router.get("/grade-card")
def get_grade_card(user=Depends(get_current_user)):
    if user["role"] != "student":
        raise HTTPException(403, "Students only")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        # Student info
        cur.execute("""
            SELECT s.student_id,
                   s.first_name, s.middle_name, s.last_name,
                   s.roll_number,
                   pt.name  AS program,
                   ptt.title AS specialization
            FROM students s
            LEFT JOIN program_types  pt  ON s.program_type_id  = pt.id
            LEFT JOIN program_titles ptt ON s.program_title_id = ptt.id
            WHERE s.user_id = %s
        """, (user["user_id"],))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Student not found")

        student_id = row[0]
        full_name  = " ".join(filter(None, [row[1], row[2], row[3]]))
        roll       = row[4] or "—"
        program    = row[5] or "Master of Technology"
        branch     = row[6] or "Computer Science & Engg."

        # All approved registrations with marks
        cur.execute("""
            SELECT
                r.offering_id,
                c.course_code, c.course_name, c.credits, c.course_type,
                acs.id   AS session_id,
                acs.year AS session_year,
                acs.session AS session_code,
                m.exam_type, m.marks
            FROM registrations r
            JOIN course_offerings co ON r.offering_id = co.offering_id
            JOIN courses c           ON co.course_id  = c.course_id
            LEFT JOIN academic_sessions acs ON co.session_id = acs.id
            LEFT JOIN marks m
                ON m.student_id = %s AND m.offering_id = r.offering_id
            WHERE r.student_id = %s AND r.status = 'approved'
            ORDER BY acs.id NULLS LAST, c.course_code, m.exam_type
        """, (student_id, student_id))

        rows = cur.fetchall()

        # Build ordered map: session → courses → marks
        sessions_map: OrderedDict = OrderedDict()

        for (offering_id, code, name, credits, ctype,
             sess_id, year, sess_code, exam_type, marks_val) in rows:

            key = sess_id or 0
            if key not in sessions_map:
                sessions_map[key] = {
                    "session_id":   sess_id,
                    "year":         year        or "",
                    "session_code": sess_code   or "",
                    "courses":      OrderedDict(),
                }
            if offering_id not in sessions_map[key]["courses"]:
                sessions_map[key]["courses"][offering_id] = {
                    "course_code": code,
                    "course_name": name,
                    "credits":     credits or 0,
                    "course_type": ctype   or "",
                    "marks":       {},
                }
            if exam_type and marks_val is not None:
                sessions_map[key]["courses"][offering_id]["marks"][exam_type] = marks_val

        # Calculate grades → SGPA → CGPA
        result_sessions = []
        cum_credits = 0
        cum_egp     = 0

        for sess in sessions_map.values():
            sem_credits = 0
            sem_egp     = 0
            courses_out = []

            for course in sess["courses"].values():
                marks   = course["marks"]
                credits = course["credits"]
                ctype   = course["course_type"]
                grade   = None
                gp      = None

                if marks:
                    if ctype == "AU" or credits == 0:
                        grade = "SS"   # Audit / non-credit
                    else:
                        total     = sum(marks.values())
                        max_total = sum(EXAM_MAX.get(et, 0) for et in marks)
                        grade, gp = marks_to_grade(total, max_total)

                if gp is not None and credits > 0:
                    sem_credits += credits
                    sem_egp     += gp * credits

                courses_out.append({
                    "course_code":  course["course_code"],
                    "course_name":  course["course_name"],
                    "credits":      credits,
                    "course_type":  ctype,
                    "grade":        grade,
                    "grade_points": gp,
                })

            sgpa = round(sem_egp / sem_credits, 2) if sem_credits else 0
            cum_credits += sem_credits
            cum_egp     += sem_egp
            cgpa = round(cum_egp / cum_credits, 2) if cum_credits else 0

            result_sessions.append({
                "session_id":   sess["session_id"],
                "year":         sess["year"],
                "session_code": sess["session_code"],
                "courses":      courses_out,
                "sem_credits":  sem_credits,
                "sem_egp":      sem_egp,
                "sgpa":         sgpa,
                "cum_credits":  cum_credits,
                "cum_egp":      cum_egp,
                "cgpa":         cgpa,
            })

        return {
            "student": {
                "name":        full_name,
                "roll_number": roll,
                "program":     program,
                "branch":      branch,
            },
            "sessions":      result_sessions,
            "cgpa":          result_sessions[-1]["cgpa"] if result_sessions else 0,
            "total_credits": cum_credits,
        }

    except HTTPException:
        raise
    except Exception:
        print("ERROR /marks/grade-card:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)