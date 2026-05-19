from fastapi import APIRouter
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/programs")


@router.get("/types")
def get_program_types():
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("SELECT id, name FROM program_types ORDER BY id")
        data = cur.fetchall()
        return [{"id": r[0], "name": r[1]} for r in data]

    finally:
        cur.close()
        release_connection(conn)


@router.get("/titles/{program_id}")
def get_titles(program_id: int):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id, title FROM program_titles WHERE program_id = %s",
            (program_id,),
        )
        data = cur.fetchall()
        return [{"id": r[0], "title": r[1]} for r in data]

    finally:
        cur.close()
        release_connection(conn)


@router.get("/{type_id}")
def get_programs(type_id: int):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            "SELECT id, name FROM programs WHERE program_type_id = %s",
            (type_id,),
        )
        data = cur.fetchall()
        return [{"id": r[0], "name": r[1]} for r in data]

    finally:
        cur.close()
        release_connection(conn)