from fastapi import APIRouter, Depends, HTTPException
from app.database.connection import get_connection, release_connection
from app.core.dependencies import get_current_user
import traceback

router = APIRouter(prefix="/hostel", tags=["Hostel"])


def require_admin(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    return user


# ── Student: view own room ─────────────────────────────────────
@router.get("/room/{student_id}")
def get_room(student_id: int, user=Depends(get_current_user)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT r.room_number, b.block_name, h.hostel_name
            FROM room_allocations ra
            JOIN rooms r  ON ra.room_id   = r.room_id
            JOIN blocks b ON r.block_id   = b.block_id
            JOIN hostels h ON b.hostel_id = h.hostel_id
            WHERE ra.student_id = %s
            ORDER BY ra.allocation_id DESC
            LIMIT 1
        """, (student_id,))
        row = cur.fetchone()
        if not row:
            return {"room": "not allocated"}
        return {"room": row[0], "block": row[1], "hostel": row[2]}
    finally:
        cur.close()
        release_connection(conn)


# ── Admin: Hostels ─────────────────────────────────────────────
@router.get("/hostels")
def list_hostels(user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT h.hostel_id, h.hostel_name, h.hostel_type,
                   COUNT(DISTINCT b.block_id)  AS block_count,
                   COUNT(DISTINCT r.room_id)   AS room_count,
                   COUNT(DISTINCT ra.allocation_id) AS allocated
            FROM hostels h
            LEFT JOIN blocks b ON b.hostel_id = h.hostel_id
            LEFT JOIN rooms  r ON r.block_id  = b.block_id
            LEFT JOIN room_allocations ra ON ra.room_id = r.room_id
            GROUP BY h.hostel_id
            ORDER BY h.hostel_name
        """)
        rows = cur.fetchall()
        return [
            {"hostel_id": r[0], "hostel_name": r[1], "hostel_type": r[2],
             "block_count": r[3], "room_count": r[4], "allocated": r[5]}
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


@router.post("/hostels")
def create_hostel(data: dict, user=Depends(require_admin)):
    name  = (data.get("hostel_name") or "").strip()
    htype = data.get("hostel_type", "boys")
    if not name:
        raise HTTPException(400, "hostel_name required")
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO hostels (hostel_name, hostel_type) VALUES (%s, %s) RETURNING hostel_id",
            (name, htype),
        )
        hid = cur.fetchone()[0]
        conn.commit()
        return {"hostel_id": hid, "message": "Hostel created"}
    finally:
        cur.close()
        release_connection(conn)


@router.delete("/hostels/{hostel_id}")
def delete_hostel(hostel_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT COUNT(*) FROM room_allocations ra
            JOIN rooms r ON ra.room_id = r.room_id
            JOIN blocks b ON r.block_id = b.block_id
            WHERE b.hostel_id = %s
        """, (hostel_id,))
        if cur.fetchone()[0] > 0:
            raise HTTPException(400, "Cannot delete: students are allocated in this hostel")
        cur.execute("DELETE FROM hostels WHERE hostel_id = %s", (hostel_id,))
        conn.commit()
        return {"message": "Hostel deleted"}
    except HTTPException:
        raise
    finally:
        cur.close()
        release_connection(conn)


# ── Admin: Blocks ──────────────────────────────────────────────
@router.get("/hostels/{hostel_id}/blocks")
def list_blocks(hostel_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT b.block_id, b.block_name,
                   COUNT(DISTINCT r.room_id) AS room_count,
                   SUM(r.capacity) AS total_capacity,
                   COUNT(DISTINCT ra.allocation_id) AS allocated
            FROM blocks b
            LEFT JOIN rooms r ON r.block_id = b.block_id
            LEFT JOIN room_allocations ra ON ra.room_id = r.room_id
            WHERE b.hostel_id = %s
            GROUP BY b.block_id
            ORDER BY b.block_name
        """, (hostel_id,))
        rows = cur.fetchall()
        return [
            {"block_id": r[0], "block_name": r[1], "room_count": r[2],
             "total_capacity": r[3] or 0, "allocated": r[4]}
            for r in rows
        ]
    finally:
        cur.close()
        release_connection(conn)


@router.post("/hostels/{hostel_id}/blocks")
def create_block(hostel_id: int, data: dict, user=Depends(require_admin)):
    name = (data.get("block_name") or "").strip()
    if not name:
        raise HTTPException(400, "block_name required")
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO blocks (block_name, hostel_id) VALUES (%s, %s) RETURNING block_id",
            (name, hostel_id),
        )
        bid = cur.fetchone()[0]
        conn.commit()
        return {"block_id": bid, "message": "Block created"}
    finally:
        cur.close()
        release_connection(conn)


# ── Admin: Rooms ───────────────────────────────────────────────
@router.get("/blocks/{block_id}/rooms")
def list_rooms(block_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT r.room_id, r.room_number, r.capacity,
                   s.student_id, s.first_name, s.last_name, s.roll_number,
                   ra.academic_year, ra.allocation_id
            FROM rooms r
            LEFT JOIN room_allocations ra ON ra.room_id = r.room_id
            LEFT JOIN students s          ON ra.student_id = s.student_id
            WHERE r.block_id = %s
            ORDER BY r.room_number
        """, (block_id,))
        rows = cur.fetchall()
        rooms: dict = {}
        for row in rows:
            rid = row[0]
            if rid not in rooms:
                rooms[rid] = {
                    "room_id": row[0], "room_number": row[1],
                    "capacity": row[2], "occupants": [],
                }
            if row[3]:
                rooms[rid]["occupants"].append({
                    "student_id":     row[3],
                    "name":           f"{row[4] or ''} {row[5] or ''}".strip(),
                    "roll_number":    row[6],
                    "academic_year":  row[7],
                    "allocation_id":  row[8],
                })
        return list(rooms.values())
    finally:
        cur.close()
        release_connection(conn)


@router.post("/blocks/{block_id}/rooms")
def create_room(block_id: int, data: dict, user=Depends(require_admin)):
    number   = (data.get("room_number") or "").strip()
    capacity = int(data.get("capacity", 2))
    if not number:
        raise HTTPException(400, "room_number required")
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO rooms (room_number, block_id, capacity) VALUES (%s, %s, %s) RETURNING room_id",
            (number, block_id, capacity),
        )
        rid = cur.fetchone()[0]
        conn.commit()
        return {"room_id": rid, "message": "Room created"}
    finally:
        cur.close()
        release_connection(conn)


# ── Admin: Allocations ─────────────────────────────────────────
@router.post("/allocate")
def allocate_student(data: dict, user=Depends(require_admin)):
    student_id    = data.get("student_id")
    room_id       = data.get("room_id")
    academic_year = (data.get("academic_year") or "").strip()
    if not all([student_id, room_id, academic_year]):
        raise HTTPException(400, "student_id, room_id, and academic_year required")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        # Check room capacity
        cur.execute("""
            SELECT r.capacity, COUNT(ra.allocation_id) AS occupied
            FROM rooms r
            LEFT JOIN room_allocations ra ON ra.room_id = r.room_id
            WHERE r.room_id = %s
            GROUP BY r.capacity
        """, (room_id,))
        row = cur.fetchone()
        if row and row[1] >= row[0]:
            raise HTTPException(400, f"Room is full ({row[0]}/{row[0]} capacity)")

        cur.execute("""
            INSERT INTO room_allocations (student_id, room_id, academic_year)
            VALUES (%s, %s, %s)
            ON CONFLICT (student_id, academic_year)
            DO UPDATE SET room_id = EXCLUDED.room_id
        """, (student_id, room_id, academic_year))
        conn.commit()
        return {"message": "Student allocated"}
    except HTTPException:
        raise
    except Exception:
        conn.rollback()
        print("ERROR /hostel/allocate:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


@router.delete("/allocations/{allocation_id}")
def remove_allocation(allocation_id: int, user=Depends(require_admin)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("DELETE FROM room_allocations WHERE allocation_id = %s", (allocation_id,))
        conn.commit()
        return {"message": "Allocation removed"}
    finally:
        cur.close()
        release_connection(conn)