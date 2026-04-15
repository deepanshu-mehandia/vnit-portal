from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.database.connection import get_connection

router = APIRouter(prefix="/registrations", tags=["Registrations"])


class RegistrationRequest(BaseModel):
    student_id: int
    offering_id: int


@router.post("")
def register_course(data: RegistrationRequest):
    conn = get_connection()
    cur = conn.cursor()

    student_id = data.student_id
    offering_id = data.offering_id

    # 🔥 insert
    cur.execute("""
        INSERT INTO registrations (student_id, offering_id)
        VALUES (%s, %s)
    """, (student_id, offering_id))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Registered successfully"}