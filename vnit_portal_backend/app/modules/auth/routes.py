from pydantic import BaseModel
from fastapi import APIRouter
from app.database.connection import get_connection
from app.core.security import verify_password, create_access_token

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT user_id, password, role
        FROM users
        WHERE username = %s
    """, (data.username,))

    user = cur.fetchone()

    # 🚨 CRITICAL FIX
    if not user:
        return {"error": "User not found"}

    user_id, hashed_password, role = user

    if not verify_password(data.password, hashed_password):
        return {"error": "Invalid password"}

    token = create_access_token({
        "user_id": user_id,
        "role": role
    })

    return {
        "access_token": token,
        "role": role
    }
