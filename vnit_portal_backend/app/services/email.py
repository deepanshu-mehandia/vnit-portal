import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_credentials_email(to_email, username, password):
    try:
        subject = "VNIT Portal - Login Credentials"

        body = f"""
Welcome to VNIT Portal 🎓

Your account has been created successfully.

Username: {username}
Password: {password}

Login:
https://vnit-portal.vercel.app/login
"""

        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = EMAIL_USER
        msg["To"] = to_email

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASS)
        server.send_message(msg)
        server.quit()

        return True

    except Exception as e:
        print("EMAIL ERROR:", e)
        return False