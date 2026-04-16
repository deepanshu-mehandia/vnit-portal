import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

EMAIL = os.getenv("GMAIL_USER")
PASSWORD = os.getenv("GMAIL_PASS")

def send_credentials_email(to_email, username, password):
    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL
        msg["To"] = to_email
        msg["Subject"] = "AIMS Account Created - Login Credentials"

        body = f"""
Dear {username.split('@')[0].upper()},

Your VNIT Portal account has been created.

Login ID: {username}
Password: {password}

Please login and change your password.

Regards,
VNIT Portal
"""

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL, PASSWORD)

        server.sendmail(EMAIL, to_email, msg.as_string())
        server.quit()

        print("EMAIL SENT SUCCESSFULLY")

        return True

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return False