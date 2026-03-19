from fastapi import APIRouter, HTTPException, Depends
from app.database.connection import get_connection
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/registration/add")
def add_course(offering_id: int, user=Depends(get_current_user)):

    student_id = user["user_id"]

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM registration WHERE student_id=%s AND offering_id=%s",
                (student_id, offering_id))

    if cur.fetchone()[0] > 0:
        raise HTTPException(400, "Already registered")

    cur.execute("""
        INSERT INTO registration(student_id, offering_id)
        VALUES(%s, %s)
    """, (student_id, offering_id))

    conn.commit()

    return {"msg": "Registered"}

@router.get("/registration/courses")
def get_courses(user=Depends(get_current_user)):

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT co.offering_id, c.course_name, c.credits,
               co.capacity, co.enrolled
        FROM course_offering co
        JOIN course c ON co.course_id = c.course_id
    """)

    rows = cur.fetchall()

    return [
        {
            "offering_id": r[0],
            "name": r[1],
            "credits": r[2],
            "capacity": r[3],
            "enrolled": r[4]
        }
        for r in rows
    ]

@router.post("/registration/drop")
def drop_course(offering_id: int, user=Depends(get_current_user)):

    student_id = user["user_id"]

    conn = get_connection()
    cur = conn.cursor()

    try:

        cur.execute("""
            DELETE FROM registration
            WHERE student_id = :1 AND offering_id = :2
        """, [student_id, offering_id])

        if cur.rowcount == 0:
            raise HTTPException(404, "Not registered")

        # update enrolled
        cur.execute("""
            UPDATE course_offering
            SET enrolled = enrolled - 1
            WHERE offering_id = :1
        """, [offering_id])

        conn.commit()

        return {"msg": "Course dropped"}

    except:
        conn.rollback()
        raise

    finally:
        cur.close()
        conn.close()
