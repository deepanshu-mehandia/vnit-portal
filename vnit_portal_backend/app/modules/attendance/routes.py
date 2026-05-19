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


@router.post("/mark")
def mark_attendance(data: AttendanceRequest, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],)
        )
        faculty = cur.fetchone()
        if not faculty:
            raise HTTPException(status_code=403, detail="Not a faculty")

        faculty_id = faculty[0]

        cur.execute("""
            SELECT 1 FROM course_offerings
            WHERE offering_id = %s AND faculty_id = %s
        """, (data.offering_id, faculty_id))

        if not cur.fetchone():
            raise HTTPException(status_code=403, detail="Not your course")

        for record in data.records:
            cur.execute("""
                SELECT 1 FROM registrations
                WHERE student_id = %s AND offering_id = %s
            """, (record.student_id, data.offering_id))

            if not cur.fetchone():
                raise HTTPException(
                    status_code=400,
                    detail=f"Student {record.student_id} not registered for this course",
                )

            # Upsert — requires the unique constraint added in the SQL migration above
            cur.execute("""
                INSERT INTO attendance (student_id, offering_id, date, status)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (student_id, offering_id, date)
                DO UPDATE SET status = EXCLUDED.status
            """, (record.student_id, data.offering_id, data.date, record.status))

        conn.commit()
        return {"message": "Attendance saved"}

    except HTTPException:
        raise
    except Exception:
        conn.rollback()
        print("ERROR IN /attendance/mark:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")

    finally:
        cur.close()
        release_connection(conn)


@router.get("/student")
def get_student_attendance(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT student_id FROM students WHERE user_id = %s", (user["user_id"],)
        )
        student = cur.fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        student_id = student[0]

        cur.execute("""
            SELECT c.course_code, c.course_name,
                   COUNT(*) FILTER (WHERE a.status = 'present') AS present,
                   COUNT(*) AS total
            FROM attendance a
            JOIN course_offerings co ON a.offering_id = co.offering_id
            JOIN courses c ON co.course_id = c.course_id
            WHERE a.student_id = %s
            GROUP BY c.course_code, c.course_name
        """, (student_id,))

        data = cur.fetchall()
        return [
            {
                "course_code": d[0],
                "course_name": d[1],
                "present": d[2],
                "total": d[3],
                "percentage": round((d[2] / d[3]) * 100, 2) if d[3] else 0,
            }
            for d in data
        ]

    except HTTPException:
        raise
    except Exception:
        print("ERROR IN /attendance/student:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")

    finally:
        cur.close()
        release_connection(conn)


@router.get("/course/{offering_id}")
def get_students_for_attendance(offering_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],)
        )
        faculty = cur.fetchone()
        if not faculty:
            raise HTTPException(status_code=403, detail="Not a faculty")

        faculty_id = faculty[0]

        cur.execute("""
            SELECT 1 FROM course_offerings
            WHERE offering_id = %s AND faculty_id = %s
        """, (offering_id, faculty_id))

        if not cur.fetchone():
            raise HTTPException(status_code=403, detail="Not your course")

        cur.execute("""
            SELECT s.student_id, s.first_name, s.last_name
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            WHERE r.offering_id = %s
        """, (offering_id,))

        students = cur.fetchall()
        return [
            {
                "student_id": s[0],
                "name": f"{s[1] or ''} {s[2] or ''}".strip(),
            }
            for s in students
        ]

    except HTTPException:
        raise
    except Exception:
        print("ERROR IN /attendance/course:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")

    finally:
        cur.close()
        release_connection(conn)


@router.get("/my-courses")
def get_my_courses(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],)
        )
        faculty = cur.fetchone()
        if not faculty:
            raise HTTPException(403, "Not faculty")

        faculty_id = faculty[0]

        cur.execute("""
            SELECT co.offering_id, c.course_code, c.course_name
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.course_id
            WHERE co.faculty_id = %s
        """, (faculty_id,))

        data = cur.fetchall()
        return [
            {"offering_id": d[0], "course_code": d[1], "course_name": d[2]}
            for d in data
        ]

    except HTTPException:
        raise
    except Exception:
        print("ERROR IN /attendance/my-courses:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")

    finally:
        cur.close()
        release_connection(conn)