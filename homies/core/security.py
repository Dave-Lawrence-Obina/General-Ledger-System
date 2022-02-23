# module
from fastapi import Request 
from fastapi.security.utils import get_authorization_scheme_param
from datetime import datetime, timedelta
from jose import jwt
from pydantic import EmailStr
import dotenv

# homies
from homies.core.config import settings
from homies.core import db

# Create a token 
def create_token(data: dict, secret_key, days=0, minutes=0):
    expire = datetime.utcnow() + timedelta(days=days, minutes=minutes)
    data.update({"exp": expire})
    encoded_jwt = jwt.encode(data, secret_key, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Verify the token
def verify_token(token, is_access_token: bool):
    user = None
    try:
        # Get scheme & param from token
        scheme, param = get_authorization_scheme_param(token)
        if scheme == "bearer":
            # Verify token
            payload = jwt.decode(
                param, 
                (settings.ACCESS_SECRET_KEY if is_access_token else settings.REFRESH_SECRET_KEY), 
                algorithms=[settings.ALGORITHM]
            )
            username: EmailStr = payload.get("sub")
            # Verify user
            if username:
                with db.session() as session:
                    session.begin()
                    sql = 'SELECT user_id, user_type, email FROM users WHERE email = :username'
                    user = session.execute(sql, {'username': username}).first()
    finally:
        return user
            
# Load env. file
dotenv_file = dotenv.find_dotenv()
dotenv.load_dotenv(dotenv_file)
    
# Auth
def auth(request: Request):
    # Get access_token & refresh_token from http-only cookie
    access_token: str = request.cookies.get("access_token")
    refresh_token: str = request.cookies.get("refresh_token")
    if not access_token and refresh_token:
        user = verify_token(refresh_token, is_access_token=False)
        if user:
            # Renew access_token
            dotenv.set_key(dotenv_file, 'ACCESS_TOKEN', 
                create_token(
                    data={"sub": user.email},
                    secret_key=settings.ACCESS_SECRET_KEY,
                    minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
                )
            )
            return {'user': user}
        else:
            return {'url': '/login?type=warning&detail=Your credentials are invalid! Please try to log in again.'}
    elif access_token:
        user = verify_token(access_token, is_access_token=True)
        if user:
            return {'user': user}
        else:
            return {'url': '/login?type=warning&detail=Your credentials are invalid! Please try to log in again.'}
    else:
        return {'url': '/login?type=info&detail=Sorry, Your session has expired! Please try to log in again.'}