# module
from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse

# homies 
from homies.routers.__init__ import templates
from homies.core.config import settings

# router for FindDoctor
router = APIRouter(
    prefix='',
    tags=['FindDoctor'],
    include_in_schema=False
)





""" REDIRECT TO 'find_doctor' """

@router.get('/find_doctor', status_code=200, response_class=HTMLResponse)
async def redirect_to_find_doctor(request: Request):
    response = templates.TemplateResponse("pages/public/find_doctor.html", 
        {
            'request'       : request,
            'browser_title' : 'Find A Doctor | Homies',
            'system_name'   : settings.SYSTEM_NAME,
            'system_version': settings.SYSTEM_VERSION
        }
    )
    # Delete tokens
    response.set_cookie(
        key="refresh_token", 
        value="", 
        expires=1, # 1 second
        max_age=1, # 1 second
        path='/',
        httponly=True, 
        samesite="Strict",
        secure=True
    )
    response.set_cookie(
        key="access_token", 
        value="", 
        expires=1, # 1 second
        max_age=1, # 1 second
        path='/',
        httponly=True, 
        samesite="Strict",
        secure=True
    )
    return response



