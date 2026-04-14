import smtplib
from email.mime.text import MIMEText
import os

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_credentials_email(to_email, username, password):
    try:
        subject = "AIMS Account Created Login Credentials"

        body = f"""
Dear {username.upper()},

We are pleased to inform you that your account for AIMS has been successfully created.

Below are your login credentials:

Login ID: {username}
Temporary Password: {password}

Steps to access your account:
1. Visit the AIMS System Login Page
2. Enter your ID and password
3. Change password after login

If you face any issue, contact Academic Section.

Thank you.
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

        print("EMAIL SENT SUCCESSFULLY")

        return True

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return False