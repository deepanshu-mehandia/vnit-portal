from fastapi import APIRouter
from typing import Optional
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("/available")
def get_available_courses(semester: Optional[int] = None, session_id: Optional[int] = None):
    """
    Get available courses with optional filtering by semester and session
    """
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
                co.session_id,
                f.name AS faculty_name,
                acs.year AS session_year,
                acs.session AS session_code
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.course_id
            JOIN faculty f ON co.faculty_id = f.faculty_id
            LEFT JOIN academic_sessions acs ON co.session_id = acs.id
        """
        params: list = []
        conditions = []
        
        if semester:
            conditions.append("c.semester = %s")
            params.append(semester)
        
        if session_id:
            conditions.append("co.session_id = %s")
            params.append(session_id)
        
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        
        query += " ORDER BY c.course_type, c.course_code"

        cur.execute(query, params)
        data = cur.fetchall()

        return [
            {
                "offering_id":   r[0],
                "course_code":   r[1],
                "course_name":   r[2],
                "credits":       r[3],
                "course_type":   r[4],
                "semester":      r[5],
                "capacity":      r[6],
                "session_id":    r[7],
                "faculty":       r[8],
                "session_year":  r[9],
                "session_code":  r[10],
            }
            for r in data
        ]

    finally:
        cur.close()
        release_connection(conn)