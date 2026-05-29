from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from app.database.connection import get_connection, release_connection
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/registrations", tags=["Registrations"])


class RegistrationRequest(BaseModel):
    student_id: int
    offering_id: int


@router.get("/my")
def get_my_registrations(session_id: Optional[int] = None, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT student_id FROM students WHERE user_id = %s", (user["user_id"],)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Student not found")
        student_id = row[0]

        query = """
            SELECT r.reg_id, r.status, r.offering_id,
                   c.course_code, c.course_name, c.credits, c.course_type,
                   f.name  AS faculty_name,
                   co.capacity
            FROM registrations r
            JOIN course_offerings co ON r.offering_id = co.offering_id
            JOIN courses c  ON co.course_id  = c.course_id
            JOIN faculty f  ON co.faculty_id = f.faculty_id
            WHERE r.student_id = %s
        """
        params: list = [student_id]

        if session_id:
            query += " AND co.session_id = %s"
            params.append(session_id)

        query += " ORDER BY c.course_code"
        cur.execute(query, params)

        rows = cur.fetchall()
        return [
            {
                "reg_id":      r[0],
                "status":      r[1],
                "offering_id": r[2],
                "course_code": r[3],
                "course_name": r[4],
                "credits":     r[5],
                "course_type": r[6],
                "faculty":     r[7],
                "capacity":    r[8],
            }
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


@router.post("")
def register_course(data: RegistrationRequest, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT student_id FROM students WHERE user_id = %s", (user["user_id"],)
        )
        row = cur.fetchone()
        if not row or row[0] != data.student_id:
            raise HTTPException(403, "Unauthorized")

        cur.execute("""
            SELECT 1 FROM registrations
            WHERE student_id = %s AND offering_id = %s
        """, (data.student_id, data.offering_id))
        if cur.fetchone():
            raise HTTPException(400, "Already registered for this course")

        cur.execute(
            "INSERT INTO registrations (student_id, offering_id) VALUES (%s, %s)",
            (data.student_id, data.offering_id),
        )
        conn.commit()
        return {"message": "Registered successfully"}
    finally:
        cur.close()
        release_connection(conn)