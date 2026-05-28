from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Literal
from app.database.connection import get_connection, release_connection
from app.core.dependencies import get_current_user
from datetime import date
import traceback

router = APIRouter(prefix="/attendance", tags=["Attendance"])


class AttendanceRecord(BaseModel):
    student_id: int
    status: Literal["present", "absent"]


class AttendanceRequest(BaseModel):
    offering_id: int
    date: date
    records: List[AttendanceRecord]


def _get_faculty_id(cur, user_id: int) -> int:
    cur.execute("SELECT faculty_id FROM faculty WHERE user_id = %s", (user_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(403, "Not a faculty member")
    return row[0]


def _verify_course_ownership(cur, offering_id: int, faculty_id: int):
    cur.execute("""
        SELECT 1 FROM course_offerings
        WHERE offering_id = %s AND faculty_id = %s
    """, (offering_id, faculty_id))
    if not cur.fetchone():
        raise HTTPException(403, "This course does not belong to you")


# ── Mark attendance ────────────────────────────────────────────
@router.post("/mark")
def mark_attendance(data: AttendanceRequest, user=Depends(get_current_user)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        faculty_id = _get_faculty_id(cur, user["user_id"])
        _verify_course_ownership(cur, data.offering_id, faculty_id)

        for record in data.records:
            cur.execute("""
                SELECT 1 FROM registrations
                WHERE student_id = %s AND offering_id = %s
            """, (record.student_id, data.offering_id))
            if not cur.fetchone():
                raise HTTPException(
                    400, f"Student {record.student_id} is not registered for this course"
                )

            # Upsert – needs unique constraint:
            # ALTER TABLE attendance ADD CONSTRAINT uq_att
            # UNIQUE (student_id, offering_id, date);
            cur.execute("""
                INSERT INTO attendance (student_id, offering_id, date, status)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (student_id, offering_id, date)
                DO UPDATE SET status = EXCLUDED.status
            """, (record.student_id, data.offering_id, data.date, record.status))

        conn.commit()
        return {"message": "Attendance saved successfully"}

    except HTTPException:
        raise
    except Exception:
        conn.rollback()
        print("ERROR /attendance/mark:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Get existing marks for a date (so faculty can edit) ────────
@router.get("/course/{offering_id}/marks/{date_str}")
def get_marks_for_date(offering_id: int, date_str: str, user=Depends(get_current_user)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        faculty_id = _get_faculty_id(cur, user["user_id"])
        _verify_course_ownership(cur, offering_id, faculty_id)

        cur.execute("""
            SELECT student_id, status FROM attendance
            WHERE offering_id = %s AND date = %s
        """, (offering_id, date_str))

        # Returns {student_id: status} mapping
        return {row[0]: row[1] for row in cur.fetchall()}

    except HTTPException:
        raise
    except Exception:
        print("ERROR /attendance/marks:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Student attendance summary ─────────────────────────────────
@router.get("/student")
def get_student_attendance(session_id: int = None, user=Depends(get_current_user)):
    """
    Get student attendance summary with optional session filtering
    """
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "SELECT student_id FROM students WHERE user_id = %s", (user["user_id"],)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Student not found")
        student_id = row[0]

        query = """
            SELECT c.course_code, c.course_name,
                   COUNT(*) FILTER (WHERE a.status = 'present') AS present,
                   COUNT(*) AS total,
                   acs.year AS session_year,
                   acs.session AS session_code
            FROM attendance a
            JOIN course_offerings co ON a.offering_id = co.offering_id
            JOIN courses c           ON co.course_id  = c.course_id
            LEFT JOIN academic_sessions acs ON co.session_id = acs.id
            WHERE a.student_id = %s
        """
        params = [student_id]
        
        if session_id:
            query += " AND co.session_id = %s"
            params.append(session_id)
        
        query += """
            GROUP BY c.course_code, c.course_name, acs.year, acs.session
            ORDER BY c.course_code
        """

        cur.execute(query, params)

        return [
            {
                "course_code":   d[0],
                "course_name":   d[1],
                "present":       d[2],
                "total":         d[3],
                "percentage":    round((d[2] / d[3]) * 100, 2) if d[3] else 0,
                "session_year":  d[4],
                "session_code":  d[5],
            }
            for d in cur.fetchall()
        ]

    except HTTPException:
        raise
    except Exception:
        print("ERROR /attendance/student:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Students enrolled in a course (for marking) ────────────────
@router.get("/course/{offering_id}")
def get_students_for_course(offering_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        faculty_id = _get_faculty_id(cur, user["user_id"])
        _verify_course_ownership(cur, offering_id, faculty_id)

        cur.execute("""
            SELECT s.student_id, s.first_name, s.last_name, s.roll_number
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            WHERE r.offering_id = %s
            ORDER BY s.first_name
        """, (offering_id,))

        return [
            {
                "student_id":  s[0],
                "name":        f"{s[1] or ''} {s[2] or ''}".strip(),
                "roll_number": s[3],
            }
            for s in cur.fetchall()
        ]

    except HTTPException:
        raise
    except Exception:
        print("ERROR /attendance/course:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Faculty's own courses ──────────────────────────────────────
@router.get("/my-courses")
def get_my_courses(session_id: int = None, user=Depends(get_current_user)):
    """
    Get faculty's courses with optional session filtering
    """
    conn = get_connection()
    cur  = conn.cursor()
    try:
        faculty_id = _get_faculty_id(cur, user["user_id"])

        query = """
            SELECT co.offering_id, c.course_code, c.course_name, c.credits,
                   acs.year AS session_year, acs.session AS session_code
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.course_id
            LEFT JOIN academic_sessions acs ON co.session_id = acs.id
            WHERE co.faculty_id = %s
        """
        params = [faculty_id]
        
        if session_id:
            query += " AND co.session_id = %s"
            params.append(session_id)
        
        query += " ORDER BY c.course_code"

        cur.execute(query, params)

        return [
            {
                "offering_id":   d[0],
                "course_code":   d[1],
                "course_name":   d[2],
                "credits":       d[3],
                "session_year":  d[4],
                "session_code":  d[5],
            }
            for d in cur.fetchall()
        ]

    except HTTPException:
        raise
    except Exception:
        print("ERROR /attendance/my-courses:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)