from fastapi import APIRouter, BackgroundTasks
from app.database.connection import get_connection, release_connection
from app.core.security import hash_password
from app.services.email import send_credentials_email
import random, string

router = APIRouter(prefix="/admission", tags=["Admission"])


def generate_password(length=8):
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


@router.post("")
def submit_admission(data: dict, background_tasks: BackgroundTasks):
    conn = get_connection()
    cur  = conn.cursor()

    try:
        username = data["email"]

        cur.execute("SELECT user_id FROM users WHERE username = %s", (username,))
        existing_user = cur.fetchone()

        if existing_user:
            user_id = existing_user[0]
            cur.execute("SELECT student_id FROM students WHERE user_id = %s", (user_id,))
            if cur.fetchone():
                return {"message": "You have already applied"}
            raw_password = None
        else:
            raw_password = generate_password()
            hashed       = hash_password(raw_password)

            cur.execute("""
                INSERT INTO users (username, password, role)
                VALUES (%s, %s, %s) RETURNING user_id
            """, (username, hashed, "student"))
            user_id = cur.fetchone()[0]

            # Pass first_name so the email says "Dear DEEPANSHU" not "Dear EMAIL"
            background_tasks.add_task(
                send_credentials_email,
                data["email"],
                username,
                raw_password,
                data.get("first_name", ""),
            )

        cur.execute("""
            INSERT INTO students (
                user_id,
                first_name, middle_name, last_name,
                father_name, mother_name,
                email, mobile, dob,
                gender, category,
                state, city, pin, address,
                aadhaar, blood_group,
                program_type_id, program_id, program_title_id
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        """, (
            user_id,
            data["first_name"], data.get("middle_name"), data["last_name"],
            data["father_name"], data["mother_name"],
            data["email"], data["mobile"], data["dob"],
            data["gender"], data["category"],
            data["state"], data["city"], data["pin"], data["address"],
            data["aadhaar"], data["blood_group"],
            data["program_type_id"], data["program_id"], data["program_title_id"],
        ))

        conn.commit()
        return {"message": "Admission successful", "username": username}

    finally:
        cur.close()
        release_connection(conn)