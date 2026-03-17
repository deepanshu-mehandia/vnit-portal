from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt

SECRET_KEY = "super-secret-key"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(token=Depends(security)):

    try:
        payload = jwt.decode(
            token.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload

    except:
        raise HTTPException(status_code=401, detail="Invalid token")
        
def require_role(role: str):

    def checker(user=Depends(get_current_user)):
        if user.get("role") != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user

    return checker
