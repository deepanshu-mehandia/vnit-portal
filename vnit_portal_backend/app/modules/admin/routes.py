from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection

router = APIRouter(prefix="/admin")

# 🔐 ADMIN GUARD
def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user

# 🔐 FACULTY GUARD
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
        # total
        cur.execute("SELECT COUNT(*) FROM students")
        total = cur.fetchone()[0]

        # approved
        cur.execute("SELECT COUNT(*) FROM registrations WHERE status='approved'")
        approved = cur.fetchone()[0]

        # pending
        cur.execute("SELECT COUNT(*) FROM registrations WHERE status='pending'")
        pending = cur.fetchone()[0]

        return {
            "total": total,
            "approved": approved,
            "pending": pending
        }

    finally:
        cur.close()
        release_connection(conn)

@router.post("/assign-advisor")
def assign_advisor(data: dict, user=Depends(require_admin)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        for sid in data["student_ids"]:
            cur.execute("""
                UPDATE students
                SET advisor_id = %s
                WHERE student_id = %s
            """, (data["faculty_id"], sid))

        conn.commit()
        return {"message": "Advisor assigned"}

    finally:
        cur.close()
        release_connection(conn)


@router.get("/faculty/students")
def get_students(user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT faculty_id FROM faculty WHERE user_id=%s", (user["user_id"],))
        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Faculty not found")

        faculty_id = row[0]

        cur.execute("""
            SELECT student_id, name
            FROM students
            WHERE advisor_id = %s
        """, (faculty_id,))

        rows = cur.fetchall()

        return [{"student_id": r[0], "name": r[1]} for r in rows]

    finally:
        cur.close()
        release_connection(conn)


@router.get("/faculty/pending")
def pending(user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT faculty_id FROM faculty WHERE user_id=%s", (user["user_id"],))
        faculty_id = cur.fetchone()[0]

        cur.execute("""
            SELECT r.reg_id, s.name, r.status
            FROM registrations r
            JOIN students s ON r.student_id = s.student_id
            WHERE s.advisor_id = %s AND r.status = 'pending'
        """, (faculty_id,))

        rows = cur.fetchall()

        return [
            {"reg_id": r[0], "name": r[1], "status": r[2]}
            for r in rows
        ]

    finally:
        cur.close()
        release_connection(conn)


@router.post("/faculty/approve")
def approve(data: dict, user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE registrations
            SET status='approved'
            WHERE reg_id=%s
        """, (data["reg_id"],))

        conn.commit()
        return {"message": "Approved"}

    finally:
        cur.close()
        release_connection(conn)


@router.post("/faculty/reject")
def reject(data: dict, user=Depends(require_faculty)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            UPDATE registrations
            SET status='rejected'
            WHERE reg_id=%s
        """, (data["reg_id"],))

        conn.commit()
        return {"message": "Rejected"}

    finally:
        cur.close()
        release_connection(conn)


@router.post("/registration/add")
def register(offering_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT student_id FROM students
            WHERE user_id=%s
        """, (user["user_id"],))

        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Student not found")

        student_id = row[0]

        cur.execute("""
            INSERT INTO registrations (student_id, offering_id)
            VALUES (%s, %s)
        """, (student_id, offering_id))

        conn.commit()

        return {"message": "Registered (pending approval)"}

    finally:
        cur.close()
        release_connection(conn)

@router.get("/students/all")
def get_all_students(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT student_id, name, email FROM students")
    rows = cur.fetchall()

    return [
        {"student_id": r[0], "name": r[1], "email": r[2]}
        for r in rows
    ]