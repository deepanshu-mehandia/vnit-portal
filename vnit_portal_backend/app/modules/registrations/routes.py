from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Depends
from app.database.connection import get_connection, release_connection
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/registrations", tags=["Registrations"])


class RegistrationRequest(BaseModel):
    student_id: int
    offering_id: int


@router.post("")
def register_course(data: RegistrationRequest, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # Verify the student_id belongs to the calling user
        cur.execute(
            "SELECT student_id FROM students WHERE user_id = %s", (user["user_id"],)
        )
        row = cur.fetchone()
        if not row or row[0] != data.student_id:
            raise HTTPException(status_code=403, detail="Unauthorized")

        cur.execute("""
            SELECT 1 FROM registrations
            WHERE student_id = %s AND offering_id = %s
        """, (data.student_id, data.offering_id))

        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Already registered")

        cur.execute("""
            INSERT INTO registrations (student_id, offering_id)
            VALUES (%s, %s)
        """, (data.student_id, data.offering_id))

        conn.commit()
        return {"message": "Registered successfully"}

    finally:
        cur.close()
        release_connection(conn)