from fastapi import APIRouter
from app.core.security import create_access_token
from app.database.connection import get_connection
from app.core.security import verify_password

router = APIRouter(prefix="/auth")

@router.post("/login")

def login(username:str,password:str):

    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT user_id,password_hash
            FROM users
            WHERE username=:1
        """,[username])
        if not verify_password(password,row[1]):
            return {"error":"wrong password"}
        
        row = cur.fetchone()

        if not row:
            return {"error":"invalid username"}

        token = create_access_token(
            {"user_id":row[0]}
        )

        return {"token":token}
    
    finally:
        cur.close()
        conn.close()
