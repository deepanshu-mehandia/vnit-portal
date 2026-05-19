from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.database.connection import get_connection, release_connection
from app.core.security import verify_password, create_access_token, hash_password
from app.core.dependencies import get_current_user
import traceback

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "SELECT user_id, username, password, role FROM users WHERE username = %s",
            (data.username,),
        )
        user = cur.fetchone()
        if not user:
            raise HTTPException(401, "Invalid credentials")

        user_id, username, hashed_password, role = user

        if not verify_password(data.password, hashed_password):
            raise HTTPException(401, "Invalid credentials")

        token = create_access_token({"user_id": user_id, "role": role})

        student_id = None
        is_advisor  = False
        display_name = username

        if role == "student":
            cur.execute(
                "SELECT student_id, first_name, last_name FROM students WHERE user_id = %s",
                (user_id,),
            )
            row = cur.fetchone()
            if row:
                student_id   = row[0]
                display_name = f"{row[1] or ''} {row[2] or ''}".strip()

        if role == "faculty":
            cur.execute(
                "SELECT is_advisor, name FROM faculty WHERE user_id = %s", (user_id,)
            )
            row = cur.fetchone()
            if row:
                is_advisor   = bool(row[0])
                display_name = row[1] or username

        if role == "admin":
            display_name = "Administrator"

        return {
            "access_token": token,
            "token_type":   "bearer",
            "role":         role,
            "student_id":   student_id,
            "is_advisor":   is_advisor,
            "display_name": display_name,
        }

    except HTTPException:
        raise
    except Exception:
        print("ERROR IN /auth/login:\n", traceback.format_exc())
        raise HTTPException(500, "Login failed")
    finally:
        cur.close()
        release_connection(conn)


@router.post("/change-password")
def change_password(data: ChangePasswordRequest, user=Depends(get_current_user)):
    if len(data.new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT password FROM users WHERE user_id = %s", (user["user_id"],))
        row = cur.fetchone()
        if not row:
            raise HTTPException(404, "User not found")
        if not verify_password(data.current_password, row[0]):
            raise HTTPException(400, "Current password is incorrect")

        new_hash = hash_password(data.new_password)
        cur.execute(
            "UPDATE users SET password = %s WHERE user_id = %s",
            (new_hash, user["user_id"]),
        )
        conn.commit()
        return {"message": "Password changed successfully"}

    except HTTPException:
        raise
    except Exception:
        print("ERROR IN /auth/change-password:\n", traceback.format_exc())
        raise HTTPException(500, "Failed to change password")
    finally:
        cur.close()
        release_connection(conn)