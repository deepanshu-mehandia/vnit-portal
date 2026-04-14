from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from app.database.connection import get_connection
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def login(data: LoginRequest):
    conn = get_connection()
    cur = conn.cursor()

    # Get user
    cur.execute("""
        SELECT user_id, password, role
        FROM users
        WHERE username = %s
    """, (data.username,))
    
    user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id, hashed_password, role = user

    if not verify_password(data.password, hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 🔥 Get student_id separately
    student_id = None
    if role == "student":
        cur.execute("""
            SELECT student_id FROM students
            WHERE user_id = %s
        """, (user_id,))
        student = cur.fetchone()
        if student:
            student_id = student[0]

    token = create_access_token({
        "user_id": user_id,
        "role": role
    })

    cur.close()
    conn.close()

    return {
        "access_token": token,
        "role": role,
        "student_id": student_id   # ✅ correct now
    }