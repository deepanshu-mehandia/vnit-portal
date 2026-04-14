import requests
import os

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

def send_credentials_email(to_email, username, password):
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "onboarding@resend.dev",
                "to": [to_email],
                "subject": "AIMS Account Created Login Credentials",
                "html": f"""
                <p>Dear {username.upper()},</p>

                <p>Your account has been created.</p>

                <p><b>Login ID:</b> {username}<br>
                <b>Password:</b> {password}</p>

                <p>Please login and change password.</p>
                """,
            },
        )

        print("EMAIL STATUS:", response.text)

        return True

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return False