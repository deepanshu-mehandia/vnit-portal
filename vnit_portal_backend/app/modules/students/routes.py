from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection

router = APIRouter(prefix="/students")

@router.get("/{student_id}")
def get_student(student_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT student_id, name, email, mobile
            FROM students
            WHERE student_id = %s
        """, (student_id,))

        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            "student_id": row[0],
            "name": row[1],
            "email": row[2],
            "mobile": row[3]
        }

    finally:
        cur.close()
        conn.close()