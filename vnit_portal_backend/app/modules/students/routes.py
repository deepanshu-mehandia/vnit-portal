from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT
                student_id,
                first_name, middle_name, last_name,
                father_name, mother_name,
                email, mobile, dob,
                gender, category,
                state, city, pin, address,
                aadhaar, blood_group,
                program_type_id, program_id, program_title_id,
                branch_id, advisor_id, roll_number
            FROM students
            WHERE user_id = %s
        """, (current_user["user_id"],))

        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            "student_id": row[0],
            "first_name": row[1],
            "middle_name": row[2],
            "last_name": row[3],
            "father_name": row[4],
            "mother_name": row[5],
            "email": row[6],
            "mobile": row[7],
            "dob": str(row[8]) if row[8] else None,
            "gender": row[9],
            "category": row[10],
            "state": row[11],
            "city": row[12],
            "pin": row[13],
            "address": row[14],
            "aadhaar": row[15],
            "blood_group": row[16],
            "program_type_id": row[17],
            "program_id": row[18],
            "program_title_id": row[19],
            "branch_id": row[20],
            "advisor_id": row[21],
            "roll_number": row[22],
        }

    finally:
        cur.close()
        release_connection(conn)


@router.get("/{student_id}")
def get_student(student_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT student_id, first_name, middle_name, last_name, email, mobile
            FROM students
            WHERE student_id = %s
        """, (student_id,))

        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Student not found")

        return {
            "student_id": row[0],
            "first_name": row[1],
            "middle_name": row[2],
            "last_name": row[3],
            "email": row[4],
            "mobile": row[5],
        }

    finally:
        cur.close()
        release_connection(conn)