from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from app.database.connection import get_connection, release_connection
from app.core.dependencies import get_current_user
import traceback

router = APIRouter(prefix="/marks", tags=["Marks"])

EXAM_MAX = {"UT1": 30, "UT2": 30, "Assignment": 20, "End Sem": 60, "Lab": 50}


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

            # Check if exists → update, else insert
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

        # Get students + their marks
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