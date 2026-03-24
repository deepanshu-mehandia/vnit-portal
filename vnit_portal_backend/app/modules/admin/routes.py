from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.database.connection import get_connection

router = APIRouter()

@router.post("/assign-advisor")
def assign_advisor(data: dict, user=Depends(get_current_user)):

    if user["role"] != "admin":
        return {"error": "Unauthorized"}

    student_ids = data["student_ids"]
    faculty_id = data["faculty_id"]

    conn = get_connection()
    cur = conn.cursor()

    for sid in student_ids:
        cur.execute("""
            UPDATE students
            SET advisor_id = %s
            WHERE student_id = %s
        """, (faculty_id, sid))

    conn.commit()

    return {"message": "Advisor assigned"}

@router.get("/faculty/students")
def get_students(user=Depends(get_current_user)):

    if user["role"] != "faculty":
        return {"error": "Unauthorized"}

    conn = get_connection()
    cur = conn.cursor()

    # get faculty_id
    cur.execute("SELECT faculty_id FROM faculty WHERE user_id=%s", (user["user_id"],))
    faculty_id = cur.fetchone()[0]

    cur.execute("""
        SELECT * FROM students
        WHERE advisor_id = %s
    """, (faculty_id,))

    rows = cur.fetchall()

    return rows

@router.get("/faculty/pending")
def pending(user=Depends(get_current_user)):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT f.faculty_id FROM faculty f
        WHERE f.user_id = %s
    """, (user["user_id"],))

    faculty_id = cur.fetchone()[0]

    cur.execute("""
        SELECT r.reg_id, s.name, c.course_name, r.status
        FROM registrations r
        JOIN students s ON r.student_id = s.student_id
        JOIN course_offerings co ON r.offering_id = co.offering_id
        JOIN courses c ON co.course_id = c.course_id
        WHERE s.advisor_id = %s
        AND r.status = 'pending'
    """, (faculty_id,))

    return cur.fetchall()

@router.post("/faculty/approve")
def approve(data: dict, user=Depends(get_current_user)):

    reg_id = data["reg_id"]

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE registrations
        SET status='approved'
        WHERE reg_id=%s
    """, (reg_id,))

    conn.commit()

    return {"message": "Approved"}

@router.post("/faculty/reject")
def reject(data: dict, user=Depends(get_current_user)):

    reg_id = data["reg_id"]

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE registrations
        SET status='rejected'
        WHERE reg_id=%s
    """, (reg_id,))

    conn.commit()

    return {"message": "Rejected"}

@router.post("/registration/add")
def register(offering_id: int, user=Depends(get_current_user)):

    conn = get_connection()
    cur = conn.cursor()

    # get student_id
    cur.execute("""
        SELECT student_id FROM students
        WHERE user_id=%s
    """, (user["user_id"],))

    student_id = cur.fetchone()[0]

    cur.execute("""
        INSERT INTO registrations (student_id, offering_id)
        VALUES (%s, %s)
    """, (student_id, offering_id))

    conn.commit()

    return {"message": "Registered (pending approval)"}
