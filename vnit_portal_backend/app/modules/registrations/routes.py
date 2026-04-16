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

    # 🔥 check duplicate
    cur.execute("""
        SELECT 1 FROM registrations
        WHERE student_id = %s AND offering_id = %s
    """, (student_id, offering_id))

    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Already registered")

    cur.execute("""
        INSERT INTO registrations (student_id, offering_id)
        VALUES (%s, %s)
    """, (student_id, offering_id))

    conn.commit()
    cur.close()
    release_connection(conn)

    return {"message": "Registered successfully"}