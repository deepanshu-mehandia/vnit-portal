from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/admin")


def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    return user


def require_faculty(user=Depends(get_current_user)):
    if user["role"] != "faculty":
        raise HTTPException(403, "Faculty only")
    return user


def require_advisor(user=Depends(get_current_user)):
    if user["role"] != "faculty":
        raise HTTPException(403, "Faculty only")
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT is_advisor FROM faculty WHERE user_id = %s", (user["user_id"],))
        row = cur.fetchone()
        if not row or not row[0]:
            raise HTTPException(403, "Only faculty advisors can access this")
        return user
    finally:
        cur.close()
        release_connection(conn)


# ── ADMIN ──────────────────────────────────────────────────────
@router.get("/stats")
def get_stats(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
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
    cur  = conn.cursor()
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


@router.get("/students/all")
def get_all_students(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT s.student_id,
                   s.first_name, s.last_name,
                   s.email, s.mobile,
                   s.roll_number, s.gender, s.category,
                   f.name AS advisor_name
            FROM students s
            LEFT JOIN faculty f ON s.advisor_id = f.faculty_id
            ORDER BY s.first_name
        """)
        rows = cur.fetchall()
        return [
            {
                "student_id":   r[0],
                "name":         f"{r[1] or ''} {r[2] or ''}".strip(),
                "email":        r[3],
                "mobile":       r[4],
                "roll_number":  r[5],
                "gender":       r[6],
                "category":     r[7],
                "advisor_name": r[8],
            }
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


@router.get("/students/{student_id}")
def get_student_detail(student_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT s.student_id,
                   s.first_name, s.middle_name, s.last_name,
                   s.email, s.mobile,
                   s.dob, s.gender, s.category,
                   s.roll_number, s.blood_group, s.aadhaar,
                   s.state, s.city, s.pin, s.address,
                   s.father_name, s.mother_name,
                   f.name AS advisor_name,
                   pt.name AS program_type,
                   p.name  AS program,
                   ptt.title AS program_title
            FROM students s
            LEFT JOIN faculty f       ON s.advisor_id       = f.faculty_id
            LEFT JOIN program_types pt ON s.program_type_id = pt.id
            LEFT JOIN programs p      ON s.program_id       = p.id
            LEFT JOIN program_titles ptt ON s.program_title_id = ptt.id
            WHERE s.student_id = %s
        """, (student_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Student not found")
        return {
            "student_id":    row[0],
            "first_name":    row[1],
            "middle_name":   row[2],
            "last_name":     row[3],
            "email":         row[4],
            "mobile":        row[5],
            "dob":           str(row[6]) if row[6] else None,
            "gender":        row[7],
            "category":      row[8],
            "roll_number":   row[9],
            "blood_group":   row[10],
            "aadhaar":       row[11],
            "state":         row[12],
            "city":          row[13],
            "pin":           row[14],
            "address":       row[15],
            "father_name":   row[16],
            "mother_name":   row[17],
            "advisor_name":  row[18],
            "program_type":  row[19],
            "program":       row[20],
            "program_title": row[21],
        }
    finally:
        cur.close()
        release_connection(conn)


# ── ADMIN: Faculty list ────────────────────────────────────────
@router.get("/faculty/all")
def get_all_faculty(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT f.faculty_id, f.name, f.email,
                   f.designation, f.qualification,
                   f.research_area, f.is_advisor,
                   c.course_code, c.course_name, c.credits,
                   co.offering_id
            FROM faculty f
            LEFT JOIN course_offerings co ON f.faculty_id = co.faculty_id
            LEFT JOIN courses c ON co.course_id = c.course_id
            ORDER BY f.name, c.course_code
        """)
        rows = cur.fetchall()

        faculty_map: dict = {}
        for row in rows:
            fid = row[0]
            if fid not in faculty_map:
                faculty_map[fid] = {
                    "faculty_id":    row[0],
                    "name":          row[1],
                    "email":         row[2],
                    "designation":   row[3],
                    "qualification": row[4],
                    "research_area": row[5],
                    "is_advisor":    row[6],
                    "courses":       [],
                }
            if row[7]:   # course_code present
                faculty_map[fid]["courses"].append({
                    "offering_id": row[10],
                    "course_code": row[7],
                    "course_name": row[8],
                    "credits":     row[9],
                })

        return list(faculty_map.values())
    finally:
        cur.close()
        release_connection(conn)


# ── FACULTY / ADVISOR ──────────────────────────────────────────
@router.get("/faculty/students")
def get_advisor_students(user=Depends(require_advisor)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Faculty not found")
        faculty_id = row[0]

        cur.execute("""
            SELECT student_id, first_name, last_name
            FROM students WHERE advisor_id = %s
        """, (faculty_id,))
        rows = cur.fetchall()
        return [
            {"student_id": r[0], "name": f"{r[1] or ''} {r[2] or ''}".strip()}
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


@router.get("/faculty/pending")
def pending_approvals(user=Depends(require_advisor)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT faculty_id FROM faculty WHERE user_id = %s", (user["user_id"],))
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
            JOIN students s        ON r.student_id  = s.student_id
            JOIN course_offerings co ON r.offering_id = co.offering_id
            JOIN courses c         ON co.course_id   = c.course_id
            WHERE s.advisor_id = %s AND r.status = 'pending'
            ORDER BY s.first_name, c.course_code
        """, (faculty_id,))
        rows = cur.fetchall()
        return [
            {
                "reg_id":      r[0],
                "name":        f"{r[1] or ''} {r[2] or ''}".strip(),
                "course_name": f"{r[3]} – {r[4]}",
                "status":      r[5],
            }
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


@router.post("/faculty/approve")
def approve_registration(data: dict, user=Depends(require_advisor)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("UPDATE registrations SET status='approved' WHERE reg_id = %s", (data["reg_id"],))
        conn.commit()
        return {"message": "Approved"}
    finally:
        cur.close()
        release_connection(conn)


@router.post("/faculty/reject")
def reject_registration(data: dict, user=Depends(require_advisor)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("UPDATE registrations SET status='rejected' WHERE reg_id = %s", (data["reg_id"],))
        conn.commit()
        return {"message": "Rejected"}
    finally:
        cur.close()
        release_connection(conn)