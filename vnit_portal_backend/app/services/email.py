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
                "from": "VNIT Portal <onboarding@resend.dev>",
                "to": [to_email],
                "subject": "AIMS Account Created Login Credentials",
                "html": f"""
                <p>Dear {username.split('@')[0].upper()},</p>

                <p>We are pleased to inform you that your account for AIMS has been successfully created.</p>

                <p><b>Login ID:</b> {username}<br>
                <b>Temporary Password:</b> {password}</p>

                <p><b>Steps to access your account:</b></p>
                <ol>
                <li>Visit the AIMS Login Page</li>
                <li>Enter your Login ID and password</li>
                <li>Change password after first login</li>
                </ol>

                <p>If you face any issue, contact Academic Section.</p>

                <p>Regards,<br>VNIT Academic Portal</p>
                """,
            },
        )

        print("EMAIL STATUS:", response.text)

        return True

    except Exception as e:
        print("EMAIL ERROR:", str(e))
        return False