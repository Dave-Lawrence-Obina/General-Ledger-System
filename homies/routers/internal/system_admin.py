# module
from fastapi import APIRouter, Request, Depends, responses
from fastapi.responses import HTMLResponse
import dotenv

# homies 
from homies.routers.__init__ import templates
from homies.core import security
#from homies.schemas.recruitment_management.user import UserGet  
from homies.core.config import settings

# Load .env file
dotenv_file = dotenv.find_dotenv()
dotenv.load_dotenv(dotenv_file)

# router for SystemAdmin
router = APIRouter(
    prefix='',
    tags=['SystemAdmin'],
    include_in_schema=False
)





""" REDIRECT TO 'system admin' """

@router.get('/system_admin', status_code=200, response_class=HTMLResponse)
async def redirect_to_system_admin(
    request: Request, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return templates.TemplateResponse("pages/internal/system_admin.html", 
            {
                'request'       : request,
                'browser_title' : 'Dashboard | System Administration',
                'content_title' : 'Dashboard', 
                'content_subtitle': 'System Administration/Dashboard',
                'home_url': '../index',
                'is_system_admin_online': 'd-block',
                'is_system_admin_active': 'text-primary',
                'gl_url': dotenv.get_key(dotenv_file, 'GENERAL_LEDGER_INTERNAL_USER_URL'),
                'sidebar': 'internal/system_admin_sidebar',
                'dashboard_menu_item': 'active',
                'project_name'  : settings.SYSTEM_NAME, 
                'system_name'   : settings.SYSTEM_NAME,
                'system_version': settings.SYSTEM_VERSION   
            }
        )

    

