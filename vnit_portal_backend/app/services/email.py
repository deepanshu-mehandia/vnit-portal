import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

EMAIL    = os.getenv("GMAIL_USER")
PASSWORD = os.getenv("GMAIL_PASS")


def send_credentials_email(to_email: str, username: str, password: str, first_name: str = ""):
    name = (first_name or username.split("@")[0]).upper()

    try:
        msg            = MIMEMultipart()
        msg["From"]    = EMAIL
        msg["To"]      = to_email
        msg["Subject"] = "AIMS Account Created - Login Credentials"

        body = f"""Dear {name},

We are pleased to inform you that your account for AIMS has been successfully created. We are excited to have you on board!

Below are your login credentials:

    Login ID:          {username}
    Temporary Password: {password}

Steps to access your account:
  1. Visit the AIMS System Login Page at https://vnit-portal.vercel.app
  2. Enter your Login ID and temporary password.
  3. Change your password upon first login for security purposes.

Important Notes:
If you have any trouble logging in or have questions, please contact the Academic Section.

We are here to help, so feel free to reach out if you need any assistance.

Thank you for registering with us. We look forward to serving you!

Best regards,
VNIT Academic Section
Visvesvaraya National Institute of Technology, Nagpur"""

        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL, PASSWORD)
        server.sendmail(EMAIL, to_email, msg.as_string())
        server.quit()

        print(f"EMAIL SENT TO {to_email}")
        return True

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return False