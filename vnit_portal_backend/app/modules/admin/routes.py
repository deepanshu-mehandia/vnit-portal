from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/admin")


def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user


def require_faculty(user=Depends(get_current_user)):
    if user["role"] != "faculty":
        raise HTTPException(status_code=403, detail="Faculty only")
    return user


@router.get("/")
def admin_dashboard(user=Depends(require_admin)):
    return {"message": "Welcome Admin"}


@router.get("/stats")
def get_stats(user=Depends(require_admin)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT COUNT(*) FROM students")
        total = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM registrations WHERE status='approved'")
        approved = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM registrations WHERE status='pending'")
        pending = cur.fetchone()[0]

        return {"total": total, "approved": approved, "pending": pending}

    finally:
        cur.close()
        release_connection(conn)


@router.post("/assign-advisor")
def assign_advisor(data: dict, user=Depends(require_admin)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        for sid in data["student_ids"]:
            cur.execute(
                "UPDATE students SET advisor_id = %s WHERE student_id = %s",
                (data["faculty_id"], sid),
            )
        conn.commit()
        return {"message": "Advisor assigned"}

    finally:
        cur.close()
        release_connection(conn)


@router.get("/faculty/students")
def get_faculty_students(user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],)
        )
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Faculty not found")

        faculty_id = row[0]

        cur.execute("""
            SELECT student_id, first_name, last_name
            FROM students
            WHERE advisor_id = %s
        """, (faculty_id,))

        rows = cur.fetchall()
        return [
            {
                "student_id": r[0],
                "name": f"{r[1] or ''} {r[2] or ''}".strip(),
            }
            for r in rows
        ]

    finally:
        cur.close()
        release_connection(conn)


@router.get("/faculty/pending")
def pending_approvals(user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Faculty not found")
        faculty_id = row[0]

        cur.execute("""
            SELECT r.reg_id,
                   s.first_name, s.last_name,
                   c.course_code, c.course_name,
                   r.status
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            JOIN course_offerings co ON r.offering_id = co.offering_id
            JOIN courses c ON co.course_id = c.course_id
            WHERE s.advisor_id = %s AND r.status = 'pending'
        """, (faculty_id,))

        rows = cur.fetchall()
        return [
            {
                "reg_id": r[0],
                "name": f"{r[1] or ''} {r[2] or ''}".strip(),
                "course_name": f"{r[3]} - {r[4]}",
                "status": r[5],
            }
            for r in rows
        ]

    finally:
        cur.close()
        release_connection(conn)


@router.post("/faculty/approve")
def approve_registration(data: dict, user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "UPDATE registrations SET status='approved' WHERE reg_id = %s",
            (data["reg_id"],),
        )
        conn.commit()
        return {"message": "Approved"}

    finally:
        cur.close()
        release_connection(conn)


@router.post("/faculty/reject")
def reject_registration(data: dict, user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "UPDATE registrations SET status='rejected' WHERE reg_id = %s",
            (data["reg_id"],),
        )
        conn.commit()
        return {"message": "Rejected"}

    finally:
        cur.close()
        release_connection(conn)


@router.get("/students/all")
def get_all_students(user=Depends(require_admin)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT student_id, first_name, last_name, email FROM students"
        )
        rows = cur.fetchall()
        return [
            {
                "student_id": r[0],
                "name": f"{r[1] or ''} {r[2] or ''}".strip(),
                "email": r[3],
            }
            for r in rows
        ]

    finally:
        cur.close()
        release_connection(conn)