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

# router for Index
router = APIRouter(
    prefix='',
    tags=['Index'],
    include_in_schema=False
)





""" REDIRECT TO 'index' """

@router.get('/index', status_code=200, response_class=HTMLResponse)
async def redirect_to_index(
    request: Request, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        user_type = result['user'].user_type
        return templates.TemplateResponse('pages/internal/shared/index.html', 
            {
                'request'       : request,
                'browser_title' : 'Main Dashboard | Home',
                'content_title' : 'Main Dashboard',
                'content_subtitle': 'Home/Main Dashboard',
                'is_home_active': 'text-primary',
                'is_system_admin_online': 'd-block' if user_type == 'System Administrator' else 'd-none',
                'system_admin_url': '../system_admin' if user_type == 'System Administrator' else '#',
                'gl_url': dotenv.get_key(dotenv_file, "GENERAL_LEDGER_ACCOUNTANT_URL") if user_type == 'Accountant' else dotenv.get_key(dotenv_file, "GENERAL_LEDGER_INTERNAL_USER_URL"),
                'sidebar': 'internal/index_sidebar',
                'main_dashboard_menu_item': 'active',
                'project_name'  : settings.SYSTEM_NAME,
                'system_name'   : settings.SYSTEM_NAME,
                'system_version': settings.SYSTEM_VERSION,
            }
        )  
