from fastapi import APIRouter, HTTPException
from app.database.connection import get_connection
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth")

@router.post("/login")
def login(username: str, password: str):

    conn = get_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT user_id, password_hash, role
            FROM users
            WHERE username = :1
        """, [username])

        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=401, detail="Invalid username")

        # ✅ verify password
        if not verify_password(password, row[1]):
            raise HTTPException(status_code=401, detail="Wrong password")

        # ✅ include role in token
        token = create_access_token({
            "user_id": row[0],
            "role": row[2]
        })

        return {
            "access_token": token,
            "role": user_role
               }

    finally:
        cur.close()
        conn.close()
