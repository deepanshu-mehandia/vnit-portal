from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/admin")


def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
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


# ── ADMIN: Stats ───────────────────────────────────────────────
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


# ── ADMIN: Assign advisor ──────────────────────────────────────
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


# ── ADMIN: Students list ───────────────────────────────────────
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


# ── ADMIN: Assign roll number to one student ───────────────────
@router.post("/students/{student_id}/roll-number")
def assign_roll_number(student_id: int, data: dict, user=Depends(require_admin)):
    roll = (data.get("roll_number") or "").strip()
    if not roll:
        raise HTTPException(400, "Roll number cannot be empty")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        # Check uniqueness
        cur.execute(
            "SELECT student_id FROM students WHERE roll_number = %s AND student_id != %s",
            (roll, student_id),
        )
        if cur.fetchone():
            raise HTTPException(400, f"Roll number '{roll}' is already assigned to another student")

        cur.execute(
            "UPDATE students SET roll_number = %s WHERE student_id = %s",
            (roll, student_id),
        )
        conn.commit()
        return {"message": "Roll number assigned", "roll_number": roll}
    finally:
        cur.close()
        release_connection(conn)


# ── ADMIN: Bulk auto-generate roll numbers ─────────────────────
@router.post("/students/bulk-roll-numbers")
def bulk_assign_roll_numbers(data: dict, user=Depends(require_admin)):
    """
    Auto-generate roll numbers for students who don't have one.
    Payload: { "prefix": "MT25MCS", "start": 1, "pad": 3 }
    Generates: MT25MCS001, MT25MCS002, ...
    """
    prefix = (data.get("prefix") or "").strip()
    start  = int(data.get("start", 1))
    pad    = int(data.get("pad", 3))

    if not prefix:
        raise HTTPException(400, "Prefix is required")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        # Get students without roll numbers, ordered by student_id
        cur.execute("""
            SELECT student_id FROM students
            WHERE roll_number IS NULL OR roll_number = ''
            ORDER BY student_id
        """)
        students = [r[0] for r in cur.fetchall()]

        if not students:
            return {"message": "All students already have roll numbers", "assigned": 0}

        assigned = 0
        seq = start
        for sid in students:
            roll = f"{prefix}{str(seq).zfill(pad)}"
            # Skip if this roll number already exists
            cur.execute("SELECT 1 FROM students WHERE roll_number = %s", (roll,))
            if cur.fetchone():
                seq += 1
                continue
            cur.execute("UPDATE students SET roll_number = %s WHERE student_id = %s", (roll, sid))
            assigned += 1
            seq += 1

        conn.commit()
        return {"message": f"Assigned {assigned} roll numbers", "assigned": assigned}
    finally:
        cur.close()
        release_connection(conn)


# ── ADMIN: Student detail ──────────────────────────────────────
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
            LEFT JOIN faculty f        ON s.advisor_id       = f.faculty_id
            LEFT JOIN program_types pt ON s.program_type_id  = pt.id
            LEFT JOIN programs p       ON s.program_id       = p.id
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
                   b.branch_name,
                   c.course_code, c.course_name, c.credits,
                   co.offering_id
            FROM faculty f
            LEFT JOIN branches b ON f.branch_id = b.branch_id
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
                    "department":    row[7],
                    "courses":       [],
                }
            if row[8]:
                faculty_map[fid]["courses"].append({
                    "offering_id": row[11],
                    "course_code": row[8],
                    "course_name": row[9],
                    "credits":     row[10],
                })
        return list(faculty_map.values())
    finally:
        cur.close()
        release_connection(conn)


@router.get("/faculty/by-department")
def get_faculty_by_department(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT f.faculty_id, f.name, f.email, f.designation,
                   f.qualification, f.research_area, f.is_advisor,
                   b.branch_id, b.branch_name
            FROM faculty f
            LEFT JOIN branches b ON f.branch_id = b.branch_id
            ORDER BY b.branch_name, f.name
        """)
        rows = cur.fetchall()
        departments: dict = {}
        for row in rows:
            dept_name = row[8] or "Unassigned"
            if dept_name not in departments:
                departments[dept_name] = []
            departments[dept_name].append({
                "faculty_id":    row[0],
                "name":          row[1],
                "email":         row[2],
                "designation":   row[3],
                "qualification": row[4],
                "research_area": row[5],
                "is_advisor":    row[6],
                "branch_id":     row[7],
            })
        return departments
    finally:
        cur.close()
        release_connection(conn)


# ── ADVISOR endpoints (MUST come before /faculty/{faculty_id}) ─
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
            JOIN students s          ON r.student_id  = s.student_id
            JOIN course_offerings co ON r.offering_id = co.offering_id
            JOIN courses c           ON co.course_id  = c.course_id
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


# ── ADMIN: Faculty CRUD (parameterized — MUST come after literals)
@router.get("/faculty/{faculty_id}")
def get_faculty_detail(faculty_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT f.faculty_id, f.name, f.email, f.designation,
                   f.qualification, f.research_area, f.is_advisor,
                   b.branch_id, b.branch_name
            FROM faculty f
            LEFT JOIN branches b ON f.branch_id = b.branch_id
            WHERE f.faculty_id = %s
        """, (faculty_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Faculty not found")
        return {
            "faculty_id":    row[0],
            "name":          row[1],
            "email":         row[2],
            "designation":   row[3],
            "qualification": row[4],
            "research_area": row[5],
            "is_advisor":    row[6],
            "branch_id":     row[7],
            "department":    row[8],
        }
    finally:
        cur.close()
        release_connection(conn)


@router.put("/faculty/{faculty_id}")
def update_faculty(faculty_id: int, data: dict, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        fields = []
        values = []
        allowed = ["name", "email", "designation", "qualification",
                   "research_area", "is_advisor", "branch_id"]
        for field in allowed:
            if field in data:
                fields.append(f"{field} = %s")
                values.append(data[field])
        if not fields:
            raise HTTPException(400, "No valid fields to update")
        values.append(faculty_id)
        cur.execute(f"UPDATE faculty SET {', '.join(fields)} WHERE faculty_id = %s", values)
        conn.commit()
        return {"message": "Faculty updated successfully"}
    finally:
        cur.close()
        release_connection(conn)


# ── ADMIN: Branches ────────────────────────────────────────────
@router.get("/branches/all")
def get_all_branches(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("SELECT branch_id, branch_name FROM branches ORDER BY branch_name")
        rows = cur.fetchall()
        return [{"branch_id": r[0], "branch_name": r[1]} for r in rows]
    finally:
        cur.close()
        release_connection(conn)