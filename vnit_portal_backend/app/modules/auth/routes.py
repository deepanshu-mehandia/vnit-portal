from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.database.connection import get_connection
from app.core.security import verify_password, create_access_token
import traceback

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    try:
        # ✅ get user
        cur.execute("""
            SELECT user_id, username, password, role
            FROM users
            WHERE username = %s
        """, (data.username,))

        user = cur.fetchone()

        if not user:
            raise HTTPException(401, "Invalid credentials")

        user_id, username, hashed_password, role = user

        # ✅ verify password
        if not verify_password(data.password, hashed_password):
            raise HTTPException(401, "Invalid credentials")

        # ✅ generate token
        token = create_access_token({
            "user_id": user_id,
            "role": role
        })

        return {
            "access_token": token,
            "token_type": "bearer",
            "role": role
        }

    except Exception:
        print("ERROR IN /auth/login:\n", traceback.format_exc())
        raise HTTPException(500, "Login failed")

    finally:
        cur.close()
        conn.close()