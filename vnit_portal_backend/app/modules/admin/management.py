from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection, release_connection
import traceback

router = APIRouter(prefix="/admin", tags=["Admin Management"])


def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    return user


# ── Sessions ───────────────────────────────────────────────────

@router.get("/sessions")
def list_sessions(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT acs.id, acs.year, acs.session,
                   COALESCE(acs.registration_open, true) AS registration_open,
                   COUNT(co.offering_id) AS offering_count
            FROM academic_sessions acs
            LEFT JOIN course_offerings co ON co.session_id = acs.id
            GROUP BY acs.id, acs.year, acs.session, acs.registration_open
            ORDER BY acs.year DESC, acs.session ASC
        """)
        rows = cur.fetchall()
        return [
            {
                "id":                r[0],
                "year":              r[1],
                "session":           r[2],
                "registration_open": r[3],
                "offering_count":    r[4],
            }
            for r in rows
        ]
    except Exception:
        print("ERROR /admin/sessions:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


@router.post("/sessions")
def create_session(data: dict, user=Depends(require_admin)):
    year         = (data.get("year")    or "").strip()
    session_code = (data.get("session") or "").strip().upper()
    if not year or not session_code:
        raise HTTPException(400, "year and session are required")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "SELECT id FROM academic_sessions WHERE year = %s AND session = %s",
            (year, session_code),
        )
        if cur.fetchone():
            raise HTTPException(400, f"Session {session_code} for {year} already exists")

        cur.execute("""
            INSERT INTO academic_sessions (year, session, registration_open)
            VALUES (%s, %s, true) RETURNING id
        """, (year, session_code))
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"message": "Session created", "id": new_id}
    except HTTPException:
        raise
    except Exception:
        print("ERROR POST /admin/sessions:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


@router.patch("/sessions/{session_id}/registration")
def toggle_registration(session_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "SELECT COALESCE(registration_open, true) FROM academic_sessions WHERE id = %s",
            (session_id,),
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "Session not found")
        new_val = not row[0]
        cur.execute(
            "UPDATE academic_sessions SET registration_open = %s WHERE id = %s",
            (new_val, session_id),
        )
        conn.commit()
        return {"registration_open": new_val}
    except HTTPException:
        raise
    except Exception:
        print("ERROR PATCH /admin/sessions:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


# ── Courses list (for offering creation dropdown) ──────────────

@router.get("/courses/list")
def list_all_courses(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT course_id, course_code, course_name, credits, course_type, semester
            FROM courses
            ORDER BY semester NULLS LAST, course_code
        """)
        rows = cur.fetchall()
        return [
            {
                "course_id":   r[0],
                "course_code": r[1],
                "course_name": r[2],
                "credits":     r[3],
                "course_type": r[4],
                "semester":    r[5],
            }
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


# ── Offerings ──────────────────────────────────────────────────

@router.get("/sessions/{session_id}/offerings")
def get_session_offerings(session_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT co.offering_id,
                   c.course_id, c.course_code, c.course_name,
                   c.credits, c.course_type,
                   f.faculty_id, f.name AS faculty_name,
                   co.capacity,
                   COUNT(r.reg_id) AS enrolled
            FROM course_offerings co
            JOIN courses c ON co.course_id  = c.course_id
            JOIN faculty f ON co.faculty_id = f.faculty_id
            LEFT JOIN registrations r ON r.offering_id = co.offering_id
            WHERE co.session_id = %s
            GROUP BY co.offering_id, c.course_id, c.course_code, c.course_name,
                     c.credits, c.course_type, f.faculty_id, f.name, co.capacity
            ORDER BY c.course_code
        """, (session_id,))
        rows = cur.fetchall()
        return [
            {
                "offering_id":  r[0],
                "course_id":    r[1],
                "course_code":  r[2],
                "course_name":  r[3],
                "credits":      r[4],
                "course_type":  r[5],
                "faculty_id":   r[6],
                "faculty_name": r[7],
                "capacity":     r[8],
                "enrolled":     r[9],
            }
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


@router.post("/offerings")
def create_offering(data: dict, user=Depends(require_admin)):
    course_id  = data.get("course_id")
    faculty_id = data.get("faculty_id")
    session_id = data.get("session_id")
    capacity   = int(data.get("capacity") or 60)

    if not all([course_id, faculty_id, session_id]):
        raise HTTPException(400, "course_id, faculty_id, and session_id are required")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT offering_id FROM course_offerings
            WHERE course_id = %s AND session_id = %s
        """, (course_id, session_id))
        if cur.fetchone():
            raise HTTPException(400, "This course is already offered in this session")

        cur.execute("""
            INSERT INTO course_offerings (course_id, faculty_id, session_id, capacity)
            VALUES (%s, %s, %s, %s) RETURNING offering_id
        """, (course_id, faculty_id, session_id, capacity))
        offering_id = cur.fetchone()[0]
        conn.commit()
        return {"message": "Offering created", "offering_id": offering_id}
    except HTTPException:
        raise
    except Exception:
        print("ERROR POST /admin/offerings:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


@router.put("/offerings/{offering_id}/faculty")
def change_offering_faculty(offering_id: int, data: dict, user=Depends(require_admin)):
    faculty_id = data.get("faculty_id")
    if not faculty_id:
        raise HTTPException(400, "faculty_id is required")
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "UPDATE course_offerings SET faculty_id = %s WHERE offering_id = %s",
            (faculty_id, offering_id),
        )
        conn.commit()
        return {"message": "Faculty updated"}
    finally:
        cur.close()
        release_connection(conn)


@router.put("/offerings/{offering_id}/capacity")
def update_offering_capacity(offering_id: int, data: dict, user=Depends(require_admin)):
    capacity = data.get("capacity")
    if capacity is None or int(capacity) < 1:
        raise HTTPException(400, "Valid capacity required")
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "UPDATE course_offerings SET capacity = %s WHERE offering_id = %s",
            (int(capacity), offering_id),
        )
        conn.commit()
        return {"message": "Capacity updated"}
    finally:
        cur.close()
        release_connection(conn)


@router.delete("/offerings/{offering_id}")
def delete_offering(offering_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "SELECT COUNT(*) FROM registrations WHERE offering_id = %s",
            (offering_id,),
        )
        count = cur.fetchone()[0]
        if count > 0:
            raise HTTPException(
                400, f"Cannot delete: {count} student(s) registered for this course"
            )
        cur.execute("DELETE FROM course_offerings WHERE offering_id = %s", (offering_id,))
        conn.commit()
        return {"message": "Offering deleted"}
    except HTTPException:
        raise
    except Exception:
        print("ERROR DELETE /admin/offerings:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)