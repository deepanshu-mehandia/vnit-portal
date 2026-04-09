from fastapi import APIRouter
from app.database.connection import get_connection
from app.core.security import hash_password
from app.services.email import send_credentials_email
import random
import string

router = APIRouter(prefix="/admission", tags=["Admission"])

def generate_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@router.post("")
def submit_admission(data: dict):
    conn = get_connection()
    cur = conn.cursor()

    # 🔹 Generate credentials
    username = data["email"]
    raw_password = generate_password()
    hashed_password = hash_password(raw_password)

    # 🔹 1. Insert into users table
    cur.execute("""
        INSERT INTO users (username, password, role)
        VALUES (%s, %s, %s)
        RETURNING user_id
    """, (username, hashed_password, "student"))

    user_id = cur.fetchone()[0]

    # 🔹 2. Insert into students table (link with user_id)
    cur.execute("""
        INSERT INTO students 
        (user_id, name, email, mobile, dob, gender, category, state, address,
         program_type_id, program_id, program_title_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        user_id,
        data["name"],
        data["email"],
        data["mobile"],
        data["dob"],
        data["gender"],
        data["category"],
        data["state"],
        data["address"],
        data["program_type_id"],
        data["program_id"],
        data["program_title_id"]
    ))

    conn.commit()
    cur.close()
    conn.close()

    email_sent=send_credentials_email(
        to_email=data["email"],
        username=username,
        password=raw_password
    )

    if not email_sent:
        print("Email failed but admission stored")
    
    return {
        "message": "Admission successful",
        "username": username,
        "password": raw_password  # TEMP (for testing)
    }