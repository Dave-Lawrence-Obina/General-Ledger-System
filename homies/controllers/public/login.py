# module
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends, HTTPException
from fastapi.responses import JSONResponse

# homies 
from homies.core.hashing import hasher
from homies.core.config import settings
from homies.core import security, db

# authenticate login credentials
def authenticate(request: OAuth2PasswordRequestForm = Depends()):
    with db.session() as session:
        session.begin()
        try:
            sql = 'SELECT * FROM users WHERE email = :username'
            user = session.execute(sql, {'username': request['username']}).first()
        except:
            raise HTTPException(status_code=500, detail='Internal Server Error.')
        finally:
            session.close()
    if not user or not hasher.verify(request['password'], user.password): 
        return { 'detail': 'Invalid Credentials.' }
    elif user.status == 'Inactive':
        return { 'detail': 'Your account is inactive.' }
    # if-else block is temporary 
    # other_module is temporary
    """ if user.user_type == 'Accountant':
        module = 'general_ledger'
        mode = 'private'
    else:
        module = 'other_module'
        mode = 'public' """
    # user_fullname
    mi = ''
    if user.middle_name is not None:
        mi = user.middle_name[0].upper()+". "
    user_fullname = user.first_name.title() + ' ' + mi + user.last_name.title()
    # content
    content = {
        'user_profile_pic': user.profile_pic_url,
        'user_fullname': user_fullname,
        'user_position': user.user_type, # temporary
        'user_department': 'Information Technology (IT) Department' if user.user_type == 'System Administrator' else 'Finance', # temporary
        'endpoint': '/index', # temporary
        'detail': 'Logging in...'
    }
    # response w/ content
    response = JSONResponse(content=content)
    # create access_token & refresh_token 
    access_token = security.create_token(
        data={"sub": user.email},
        secret_key=settings.ACCESS_SECRET_KEY,
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    refresh_token = security.create_token(
        data={"sub": user.email},
        secret_key=settings.REFRESH_SECRET_KEY,
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    # Set httponly cookie
    response.set_cookie(
        key="access_token", 
        value=f"bearer {access_token}", 
        path='/',
        expires=900, # 15 min
        max_age=900, # 15 min
        httponly=True, 
        samesite="Strict",
        secure=True
    )
    response.set_cookie(
        key="refresh_token", 
        value=f"bearer {refresh_token}", 
        path='/',
        expires=86400, # 1 day
        max_age=86400, # 1 day
        httponly=True, 
        samesite="Strict",
        secure=True
    )
    return response



