from fastapi import APIRouter
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/available")
def get_available_courses():
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT
                co.offering_id,
                c.course_code,
                c.course_name,
                c.credits,
                co.capacity,
                f.name AS faculty_name
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.course_id
            JOIN faculty f ON co.faculty_id = f.faculty_id
        """)

        data = cur.fetchall()
        return [
            {
                "offering_id": r[0],
                "course_code": r[1],
                "course_name": r[2],
                "credits": r[3],
                "capacity": r[4],
                "faculty": r[5],
            }
            for r in data
        ]

    finally:
        cur.close()
        release_connection(conn)