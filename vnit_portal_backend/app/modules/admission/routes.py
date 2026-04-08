from fastapi import APIRouter
from app.database.connection import get_connection

router = APIRouter(prefix="/admission", tags=["Admission"])

@router.post("")
def submit_admission(data: dict):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO students (program_type_id, program_id, program_title_id)
        VALUES (%s, %s, %s)
    """, (
        data["program_type_id"],
        data["program_id"],
        data["program_title_id"]
    ))

    conn.commit()
    cur.close()
    conn.close()

    return {"message": "Admission stored"}
