from fastapi import APIRouter
from app.database.connection import get_connection
from app.core.dependencies import require_role

router = APIRouter(prefix="/registration")

@router.post("/registration/add")
def add_course(student_id: int, offering_id: int):

    conn = get_connection()
    cur = conn.cursor()

    try:

        # ✅ duplicate check
        cur.execute("""
            SELECT COUNT(*) FROM registration
            WHERE student_id = :1 AND offering_id = :2
        """, [student_id, offering_id])

        if cur.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="Already registered")

        # ✅ credit limit check
        cur.execute("""
            SELECT NVL(SUM(c.credits),0)
            FROM registration r
            JOIN course_offering co ON r.offering_id = co.offering_id
            JOIN course c ON co.course_id = c.course_id
            WHERE r.student_id = :1
        """, [student_id])

        current_credits = cur.fetchone()[0]

        cur.execute("""
            SELECT c.credits
            FROM course_offering co
            JOIN course c ON co.course_id = c.course_id
            WHERE co.offering_id = :1
        """, [offering_id])

        course_credits = cur.fetchone()[0]

        if current_credits + course_credits > 24:
            raise HTTPException(status_code=400, detail="Credit limit exceeded")

        # ✅ insert
        cur.execute("""
            INSERT INTO registration(registration_id, student_id, offering_id)
            VALUES(reg_seq.NEXTVAL, :1, :2)
        """, [student_id, offering_id])

        conn.commit()

        return {"msg": "Course registered"}

    except:
        conn.rollback()
        raise

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
