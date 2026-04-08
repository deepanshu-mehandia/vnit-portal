from fastapi import APIRouter
from app.database.connection import get_connection

router = APIRouter(prefix="/programs", tags=["Programs"])

# 1. Program Types
@router.get("/types")
def get_program_types():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT id, name FROM program_types ORDER BY id;")
    data = cur.fetchall()

    cur.close()
    conn.close()

    return [{"id": r[0], "name": r[1]} for r in data]


# 2. Programs
@router.get("/{type_id}")
def get_programs(type_id: int):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, name FROM programs
        WHERE program_type_id = %s
        ORDER BY name;
    """, (type_id,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return [{"id": r[0], "name": r[1]} for r in data]


# 3. Program Titles
@router.get("/titles/{program_id}")
def get_titles(program_id: int):
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, title FROM program_titles
        WHERE program_id = %s
        ORDER BY title;
    """, (program_id,))

    data = cur.fetchall()

    cur.close()
    conn.close()

    return [{"id": r[0], "title": r[1]} for r in data]
