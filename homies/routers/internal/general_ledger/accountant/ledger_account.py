# module
from fastapi import APIRouter, Request, Depends, responses
from fastapi.responses import HTMLResponse

# homies 
from homies.routers.__init__ import templates
from homies.core import security
from homies.schemas.general_ledger.ledger_account import LedgerAccountGetForTable
from homies.controllers.internal.general_ledger.accountant import ledger_account
from homies.core.config import settings

# router for ledger
router = APIRouter(
    prefix='/general_ledger/accountant',
    tags=['Ledger'],
    include_in_schema=False
)





""" REDIRECT TO 'ledger' """

@router.get('/ledger', status_code=200, response_class=HTMLResponse)
async def redirect_to_ledger(
    request: Request, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return templates.TemplateResponse('pages/internal/general_ledger/accountant/ledger.html', 
            {
                'request'       : request,
                'browser_title' : 'Ledger | General Ledger',
                'content_title' : 'Ledger',
                'content_subtitle': 'General Ledger/Ledger',
                'home_url': '../../index',
                'is_finance_active': 'text-primary',
                'is_gl_active': 'active',
                'sidebar': 'internal/general_ledger/accountant_sidebar',
                'ledger_menu_item': 'active',
                'project_name'  : settings.SYSTEM_NAME,
                'system_name'   : settings.SYSTEM_NAME,
                'system_version': settings.SYSTEM_VERSION 
            }
        ) 





""" GET TABLE DATA """

@router.post('/ledger/datatable', status_code=200, response_model=LedgerAccountGetForTable, response_model_exclude_none=True) 
async def get_table_data(
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        return ledger_account.get_table_data(data)





""" POST """

@router.put('/ledger', status_code=200)
async def post(
    id: str,  
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return ledger_account.post(id, result['user'].user_id)





""" UNPOST """

@router.post('/ledger', status_code=200)
async def unpost(
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        return ledger_account.unpost(data, result['user'].user_id)
