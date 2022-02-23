# module
from fastapi import FastAPI, Request 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import secrets, dotenv

# homies 
from homies.core.config  import settings
from homies.routers.base import base_router     
from homies.models.base  import Base 
from homies.core import db

# create fastapi instance 
app = FastAPI(title=settings.SYSTEM_NAME, version=settings.SYSTEM_VERSION)

# origins
origins = [
    "http://127.0.0.1:8000/",
    "http://localhost:8000/",
]

# add middleware to allow specified different origins
app.add_middleware(
    CORSMiddleware,
    allow_credentials = True,
    allow_origins = origins,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

# load static directory
app.mount("/static", StaticFiles(directory="static"), name="static")

# include base_router
app.include_router(base_router)

# create all tables 
Base.metadata.create_all(db.engine)

# Set secret keys
dotenv_file = dotenv.find_dotenv()
dotenv.load_dotenv(dotenv_file)
""" dotenv.set_key(dotenv_file, 'ACCESS_SECRET_KEY', secrets.token_hex(64))
dotenv.set_key(dotenv_file, 'REFRESH_SECRET_KEY', secrets.token_hex(64)) """

# Middleware to renew access_token & close left db session
@app.middleware("http")
async def renew_close(request: Request, call_next):
    response = await call_next(request)
    if dotenv.get_key(dotenv_file, 'ACCESS_TOKEN'):
        # Renew access_token
        response.set_cookie(
            key="access_token", 
            value=f"bearer {dotenv.get_key(dotenv_file, 'ACCESS_TOKEN')}", 
            path='/',
            expires=900, # 15 min
            max_age=900, # 15 min
            httponly=True, 
            samesite="Strict",
            secure=True
        )
        dotenv.unset_key(dotenv_file, 'ACCESS_TOKEN')
    # Close left db session
    with db.session() as session:
        session.close()
    return response
