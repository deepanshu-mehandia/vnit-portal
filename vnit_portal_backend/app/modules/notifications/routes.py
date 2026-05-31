from fastapi import APIRouter, Depends, HTTPException
from app.core.dependencies import get_current_user
from app.database.connection import get_connection, release_connection
import traceback

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def get_notifications(user=Depends(get_current_user)):
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            SELECT n.id, n.title, n.message, n.type, n.target_role,
                   n.created_at,
                   u.username AS created_by
            FROM notifications n
            LEFT JOIN users u ON n.created_by = u.user_id
            WHERE n.target_role = 'all' OR n.target_role = %s
            ORDER BY n.created_at DESC
            LIMIT 50
        """, (user["role"],))
        rows = cur.fetchall()
        return [
            {
                "id":           r[0],
                "title":        r[1],
                "message":      r[2],
                "type":         r[3],
                "target_role":  r[4],
                "created_at":   str(r[5]) if r[5] else None,
                "created_by":   r[6],
            }
            for r in rows
        ]
    except Exception:
        print("ERROR /notifications GET:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


@router.post("")
def create_notification(data: dict, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")

    title       = (data.get("title")       or "").strip()
    message     = (data.get("message")     or "").strip()
    ntype       = data.get("type",        "info")
    target_role = data.get("target_role", "all")

    if not title or not message:
        raise HTTPException(400, "Title and message are required")

    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO notifications (title, message, type, target_role, created_by)
            VALUES (%s, %s, %s, %s, %s) RETURNING id
        """, (title, message, ntype, target_role, user["user_id"]))
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"message": "Notification created", "id": new_id}
    except Exception:
        print("ERROR /notifications POST:\n", traceback.format_exc())
        raise HTTPException(500, "Server error")
    finally:
        cur.close()
        release_connection(conn)


@router.delete("/{notification_id}")
def delete_notification(notification_id: int, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(403, "Admins only")
    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute("DELETE FROM notifications WHERE id = %s", (notification_id,))
        conn.commit()
        return {"message": "Deleted"}
    finally:
        cur.close()
        release_connection(conn)