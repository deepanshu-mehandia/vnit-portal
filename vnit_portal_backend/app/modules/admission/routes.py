from fastapi import APIRouter, BackgroundTasks
from app.database.connection import get_connection
from app.core.security import hash_password
from app.services.email import send_credentials_email
import random
import string

router = APIRouter(prefix="/admission", tags=["Admission"])

def generate_password(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@router.post("")
def submit_admission(data: dict, background_tasks: BackgroundTasks):
    conn = get_connection()
    cur = conn.cursor()

    username = data["email"]

    # CHECK USER
    cur.execute("SELECT user_id FROM users WHERE username = %s", (username,))
    existing_user = cur.fetchone()

    if existing_user:
        user_id = existing_user[0]
        raw_password = None  # already exists
    else:
        raw_password = generate_password()
        hashed_password = hash_password(raw_password)

        cur.execute("""
            INSERT INTO users (username, password, role)
            VALUES (%s, %s, %s)
            RETURNING user_id
        """, (username, hashed_password, "student"))

        user_id = cur.fetchone()[0]

        # 🔥 SEND EMAIL IN BACKGROUND
        background_tasks.add_task(
            send_credentials_email,
            data["email"],
            username,
            raw_password
        )

    # CHECK STUDENT
    cur.execute("SELECT student_id FROM students WHERE user_id = %s", (user_id,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {"message": "You have already applied"}

    # INSERT STUDENT
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

    return {
        "message": "Admission successful",
        "username": username
    }