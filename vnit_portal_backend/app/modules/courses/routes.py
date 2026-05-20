from fastapi import APIRouter
from typing import Optional
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/available")
def get_available_courses(semester: Optional[int] = None):
    conn = get_connection()
    cur  = conn.cursor()

    try:
        query = """
            SELECT
                co.offering_id,
                c.course_code,
                c.course_name,
                c.credits,
                c.course_type,
                c.semester,
                co.capacity,
                f.name AS faculty_name
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.course_id
            JOIN faculty f ON co.faculty_id = f.faculty_id
        """
        params: list = []
        if semester:
            query += " WHERE c.semester = %s"
            params.append(semester)
        query += " ORDER BY c.course_type, c.course_code"

        cur.execute(query, params)
        data = cur.fetchall()

        return [
            {
                "offering_id": r[0],
                "course_code": r[1],
                "course_name": r[2],
                "credits":     r[3],
                "course_type": r[4],
                "semester":    r[5],
                "capacity":    r[6],
                "faculty":     r[7],
            }
            for r in data
        ]

    finally:
        cur.close()
        release_connection(conn)