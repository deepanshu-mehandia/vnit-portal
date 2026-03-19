from fastapi import APIRouter, HTTPException
from app.database.connection import get_connection
from app.core.security import hash_password, verify_password, create_token

router = APIRouter(prefix="/auth")

@router.post("/login")
def login(data: dict):

    username = data["username"]
    password = data["password"]

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT user_id, password, role FROM users WHERE username=%s", (username,))
    user = cur.fetchone()

    if not user:
        raise HTTPException(400, "User not found")

    if not verify_password(password, user[1]):
        raise HTTPException(400, "Invalid password")

    token = create_token({
        "user_id": user[0],
        "role": user[2]
    })

    return {
        "access_token": token,
        "role": user[2]
    }
