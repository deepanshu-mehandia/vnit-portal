from fastapi import APIRouter
from app.database.connection import get_connection

router = APIRouter(prefix="/registrations", tags=["Registrations"])

@router.post("")
def register_course(data: dict):
    conn = get_connection()
    cur = conn.cursor()

    student_id = data["student_id"]
    offering_id = data["offering_id"]

    # prevent duplicate registration
    cur.execute("""
        SELECT 1 FROM registrations 
        WHERE student_id = %s AND offering_id = %s
    """, (student_id, offering_id))

    if cur.fetchone():
        return {"message": "Already registered"}

    cur.execute("""
        INSERT INTO registrations (student_id, offering_id, status)
        VALUES (%s, %s, 'pending')
    """, (student_id, offering_id))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Registration successful"}