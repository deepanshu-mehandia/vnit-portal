from fastapi import APIRouter
from datetime import datetime
from app.database.connection import get_connection, release_connection

router = APIRouter(prefix="/session", tags=["Session"])


@router.get("/current")
def get_current_session():
    now   = datetime.now()
    month = now.month
    year  = now.year

    if 7 <= month <= 12:
        code    = f"W{str(year)[2:]}"
        sem_num = 1
        ay      = f"{year}-{year + 1}"
        label   = f"Odd Semester — July to December {year}"
    else:
        code    = f"S{str(year)[2:]}"
        sem_num = 2
        ay      = f"{year - 1}-{year}"
        label   = f"Even Semester — January to June {year}"

    return {
        "session":     code,
        "semester":    sem_num,
        "year":        ay,
        "label":       f"Academic Year {ay} · {label}",
        "short_label": f"{code} | Sem {sem_num}",
    }


@router.get("/all")
def get_all_sessions():
    """Return all academic sessions from DB, ordered newest first."""
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT id, year, session
            FROM academic_sessions
            ORDER BY year DESC, session ASC
        """)
        rows = cur.fetchall()
        return [{"id": r[0], "year": r[1], "session": r[2]} for r in rows]
    finally:
        cur.close()
        release_connection(conn)