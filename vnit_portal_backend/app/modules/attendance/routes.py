from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.database.connection import get_connection
from app.core.auth import get_current_user

router = APIRouter(prefix="/attendance", tags=["Attendance"])

class AttendanceRecord(BaseModel):
    student_id: int
    status: str  # present / absent

class AttendanceRequest(BaseModel):
    offering_id: int
    date: str
    records: List[AttendanceRecord]


@router.post("/mark")
def mark_attendance(data: AttendanceRequest):
    conn = get_connection()
    cur = conn.cursor()

    for record in data.records:

        # 🔥 VALIDATION: student must be registered
        cur.execute("""
            SELECT 1 FROM registrations
            WHERE student_id = %s AND offering_id = %s
        """, (record.student_id, data.offering_id))

        if not cur.fetchone():
            raise HTTPException(
                status_code=400,
                detail=f"Student {record.student_id} not registered"
            )

        # 🔥 INSERT (ON CONFLICT to avoid duplicates)
        cur.execute("""
            INSERT INTO attendance (student_id, offering_id, date, status)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (student_id, offering_id, date)
            DO UPDATE SET status = EXCLUDED.status
        """, (
            record.student_id,
            data.offering_id,
            data.date,
            record.status
        ))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Attendance saved"}

@router.get("/student")
def get_student_attendance(user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    # 🔥 get student_id
    cur.execute("""
        SELECT student_id FROM students
        WHERE user_id = %s
    """, (user["user_id"],))

    student = cur.fetchone()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student_id = student[0]

    # 🔥 fetch attendance
    cur.execute("""
        SELECT c.course_code, c.course_name,
               COUNT(*) FILTER (WHERE a.status='present') as present,
               COUNT(*) as total
        FROM attendance a
        JOIN course_offerings co ON a.offering_id = co.offering_id
        JOIN courses c ON co.course_id = c.course_id
        WHERE a.student_id = %s
        GROUP BY c.course_code, c.course_name
    """, (student_id,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return [
        {
            "course_code": d[0],
            "course_name": d[1],
            "present": d[2],
            "total": d[3],
            "percentage": round((d[2]/d[3])*100, 2) if d[3] else 0
        }
        for d in data
    ]

@router.get("/course/{offering_id}")
def get_students_for_attendance(offering_id: int):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT s.student_id, s.name
        FROM registrations r
        JOIN students s ON r.student_id = s.student_id
        WHERE r.offering_id = %s
    """, (offering_id,))

    students = cur.fetchall()

    cur.close()
    conn.close()

    return [
        {"student_id": s[0], "name": s[1]}
        for s in students
    ]