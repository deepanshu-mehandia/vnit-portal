import os
import requests

# Set this in your Render Environment Variables
APPS_SCRIPT_URL = os.getenv("APPS_SCRIPT_URL") 
SECRET_KEY = "my_secret_aims_portal_key_2109" # Must match the script

def send_credentials_email(to_email: str, username: str, password: str, first_name: str = ""):
    name = (first_name or username.split("@")[0]).upper()
    
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

    payload = {
        "secret_key": SECRET_KEY,
        "to_email": to_email,
        "subject": "AIMS Account Created - Login Credentials",
        "body": body
    }
    
    try:
        # Send the HTTP POST request to your Google Apps Script
        response = requests.post(APPS_SCRIPT_URL, json=payload)
        result = response.json()
        
        if result.get("status") == "success":
            print(f"EMAIL SENT TO {to_email}")
            return True
        else:
            print("APPS SCRIPT ERROR:", result.get("message"))
            return False
            
    except Exception as e:
        print("REQUEST ERROR:", str(e))
        return False