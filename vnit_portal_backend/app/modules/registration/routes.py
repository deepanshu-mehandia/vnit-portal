from fastapi import APIRouter
from app.database.connection import get_connection
from app.core.dependencies import require_role

router = APIRouter(prefix="/registration")

@router.post("/registration/add")
def add_course(..., user=Depends(require_role("student"))):
    return {"msg": "only students allowed"}

def add_course(student_id: int, offering_id: int):

    conn = get_connection()
    cur = conn.cursor()
    try:
        # check already registered
        cur.execute("""
            SELECT COUNT(*) FROM registration
            WHERE student_id = :1 AND offering_id = :2
        """, [student_id, offering_id])

        if cur.fetchone()[0] > 0:
            return {"error": "Already registered"}

        # insert
        cur.execute("""
            INSERT INTO registration(registration_id, student_id, offering_id)
            VALUES(reg_seq.NEXTVAL, :1, :2)
        """, [student_id, offering_id])
    
        conn.commit()

        return {"msg": "Course added"}
    finally:
        cur.close()
        conn.close()

@router.get("/courses/{semester_id}")

def get_courses(semester_id:int):

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT c.course_code,c.course_name
            FROM courses c
            JOIN course_offerings o
            ON c.course_id = o.course_id
            WHERE o.semester_id = :1
        """,[semester_id])

        rows = cur.fetchall()

        courses = []

        for r in rows:
            courses.append({
                "code":r[0],
                "name":r[1]
            })

        return courses
    
    finally:
        cur.close()
        conn.close()

@router.post("/registration/drop")
def drop_course(student_id: int, offering_id: int):

    cur.execute("""
        DELETE FROM registration
        WHERE student_id = :1 AND offering_id = :2
    """, [student_id, offering_id])

    conn.commit()

    return {"msg": "Course dropped"}
