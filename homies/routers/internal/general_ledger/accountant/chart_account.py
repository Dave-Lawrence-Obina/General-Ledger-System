# module
from fastapi import APIRouter, Request, Depends, responses
from fastapi.responses import HTMLResponse
from typing import List

# homies 
from homies.routers.__init__ import templates
from homies.core import security
#from homies.schemas.recruitment_management.user import UserGet
from homies.schemas.general_ledger.chart_account import ChartAccountGetForTable, ChartAccountGetAll, ChartAccountGetForSelect  
from homies.controllers.internal.general_ledger.accountant import chart_account
from homies.core.config import settings

# router for chart of accounts
router = APIRouter(
    prefix='/general_ledger/accountant',
    tags=['ChartOfAccounts'],
    include_in_schema=False
)





""" REDIRECT TO 'chart of accounts' """

@router.get('/chart_of_accounts', status_code=200, response_class=HTMLResponse)
async def redirect_to_chart_of_accounts(
    request: Request, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return templates.TemplateResponse("pages/internal/general_ledger/accountant/chart_of_accounts.html", 
            {
                'request'       : request,
                'browser_title' : 'Chart of Accounts | General Ledger',
                'content_title' : 'Chart of Accounts', 
                'content_subtitle': "General Ledger/Chart of Accounts",
                'home_url': '../../index',
                'is_finance_active': 'text-primary',
                'is_gl_active': 'active',
                'sidebar': 'internal/general_ledger/accountant_sidebar',
                'chart_of_accounts_menu_item': 'active',
                'project_name'  : settings.SYSTEM_NAME, 
                'system_name'   : settings.SYSTEM_NAME,
                'system_version': settings.SYSTEM_VERSION
            }
        ) 

    



""" GET TABLE DATA """

@router.post('/chart_of_accounts/datatable', status_code=200, response_model=ChartAccountGetForTable, response_model_exclude_none=True) 
async def get_table_data(
    request: Request,
    result = Depends(security.auth)
):  
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        return chart_account.get_table_data(data)
    




""" CREATE """

@router.post("/chart_of_accounts", status_code=201) 
async def create(
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        data['created_by'] = result['user'].user_id
        return chart_account.create(data)





""" VALIDATE """

@router.get('/chart_of_accounts/validate', status_code=200)
async def validate(
    column: str,
    value: str,
    closest: str,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return chart_account.validate(column, value, closest)




    
""" GET ONE """

@router.get('/chart_of_accounts/{chart_account_id}', status_code=200, response_model=ChartAccountGetAll, response_model_exclude_none=True)
async def get_one(
    chart_account_id: str, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return chart_account.get_one(chart_account_id)





""" GET ALL """

@router.get('/chart_accounts', status_code=200, response_model=List[ChartAccountGetForSelect])
async def get_all(
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return chart_account.get_all()





""" UPDATE """

@router.post('/chart_of_accounts/{chart_account_id}', status_code=200)
async def update(
    chart_account_id: str,
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        data['updated_by'] = result['user'].user_id
        return chart_account.update(chart_account_id, data)
   




""" DEACTIVATE / ACTIVATE """

@router.delete('/chart_of_accounts/{chart_account_id}', status_code=200)
async def de_activate(
    chart_account_id: str, 
    operation_type: int, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return chart_account.de_activate(chart_account_id, operation_type, result['user'].user_id)