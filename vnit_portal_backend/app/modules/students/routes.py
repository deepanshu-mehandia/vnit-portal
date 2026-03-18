from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.database.connection import get_connection
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/students/{id}")
def get_student(id: int, user=Depends(get_current_user)):
    return {"msg": "Protected"}

def get_student(student_id:int):

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT s.student_id,
                   s.enrollment_no,
                   s.first_name,
                   s.last_name,
                   p.email,
                   p.mobile
            FROM students s
            JOIN student_profiles p
            ON s.student_id = p.student_id
            WHERE s.student_id = :1
        """,[student_id])

        row = cur.fetchone()

        if not row:
            return {"error":"student not found"}
    
        return {
            "student_id": row[0],
            "enrollment": row[1],
            "name": row[2] + " " + row[3],
            "email": row[4],
            "mobile": row[5]
        }
    
    finally:
        cur.close()
        conn.close()
