from fastapi import APIRouter, Depends
from app.database.connection import get_connection
from app.core.dependencies import require_role

router = APIRouter(prefix="/admin")


# ✅ Dashboard stats
@router.get("/stats")
def get_stats(user=Depends(require_role("admin"))):

    conn = get_connection()
    cur = conn.cursor()

    try:
        # total students
        cur.execute("SELECT COUNT(*) FROM student")
        students = cur.fetchone()[0]

        # total registrations
        cur.execute("SELECT COUNT(*) FROM registration")
        registrations = cur.fetchone()[0]

        # total courses
        cur.execute("SELECT COUNT(*) FROM course")
        courses = cur.fetchone()[0]

        return {
            "students": students,
            "registrations": registrations,
            "courses": courses
        }

    finally:
        cur.close()
        conn.close()


# ✅ Course popularity
@router.get("/course-popularity")
def course_popularity(user=Depends(require_role("admin"))):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT c.course_name, COUNT(*) as total
        FROM registration r
        JOIN course_offering co ON r.offering_id = co.offering_id
        JOIN course c ON co.course_id = c.course_id
        GROUP BY c.course_name
        ORDER BY total DESC
    """)

    rows = cur.fetchall()

    return [{"course": r[0], "count": r[1]} for r in rows]


# ✅ Recent registrations
@router.get("/recent")
def recent_registrations(user=Depends(require_role("admin"))):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT s.first_name, c.course_name
        FROM registration r
        JOIN student s ON r.student_id = s.student_id
        JOIN course_offering co ON r.offering_id = co.offering_id
        JOIN course c ON co.course_id = c.course_id
        FETCH FIRST 10 ROWS ONLY
    """)

    rows = cur.fetchall()

    return [{"student": r[0], "course": r[1]} for r in rows]
