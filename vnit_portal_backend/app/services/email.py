import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_credentials_email(to_email, username, password):
    try:
        subject = "AIMS Account Created Login Credentials"

        body = f"""
Dear Student,

We are pleased to inform you that your account for AIMS has been successfully created.

Below are your login credentials:

Login ID: {username}
Temporary Password: {password}

Steps to access your account:
1. Visit the portal login page
2. Enter your credentials
3. Change your password after login

If you face any issues, contact the Academic Section.

Regards,
VNIT Administration
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