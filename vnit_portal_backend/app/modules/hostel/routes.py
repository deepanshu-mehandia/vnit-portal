from fastapi import APIRouter, Depends
from app.database.connection import get_connection, release_connection
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/hostel")


@router.get("/room/{student_id}")
def get_room(student_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT r.room_number, b.block_name, h.hostel_name
            FROM room_allocations ra
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN blocks b ON r.block_id = b.block_id
            JOIN hostels h ON b.hostel_id = h.hostel_id
            WHERE ra.student_id = %s
        """, (student_id,))

        row = cur.fetchone()

        if not row:
            return {"room": "not allocated"}

        return {"room": row[0], "block": row[1], "hostel": row[2]}

    finally:
        cur.close()
        release_connection(conn)