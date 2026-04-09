import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_credentials_email(to_email, username, password):
    subject = "VNIT Portal - Login Credentials"

    body = f"""
Welcome to VNIT Portal 🎓

Your account has been created successfully.

🔐 Login Credentials:
Username: {username}
Password: {password}

👉 Login here:
https://vnit-portal.vercel.app/login

⚠️ Change password after first login.

Regards,  
VNIT Administration
"""

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()

        print("EMAIL SENT SUCCESSFULLY")
        return True

    except Exception as e:
        print("EMAIL ERROR:", e)
        return False