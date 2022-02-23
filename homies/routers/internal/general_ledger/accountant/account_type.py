# module
from fastapi import APIRouter, Request, Depends, responses
from fastapi.responses import HTMLResponse
from typing import List

# homies 
from homies.routers.__init__ import templates
from homies.core import security
#from homies.schemas.recruitment_management.user import UserGet
from homies.schemas.general_ledger.account_type import AccountTypeGetForTable, AccountTypeGetAll, AccountTypeGetForSelect  
from homies.controllers.internal.general_ledger.accountant import account_type
from homies.core.config import settings

# router for account type
router = APIRouter(
    prefix='/general_ledger/accountant',
    tags=['AccountType'],
    include_in_schema=False
)





""" REDIRECT TO 'account type' """

@router.get('/account_type', status_code=200, response_class=HTMLResponse)
async def redirect_to_account_type(
    request: Request, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return templates.TemplateResponse("pages/internal/general_ledger/accountant/account_type.html", 
            {
                'request'       : request,
                'browser_title' : 'Account Type | General Ledger',
                'content_title' : 'Account Type', 
                'content_subtitle': 'General Ledger/Account Type',
                'home_url': '../../index',
                'is_finance_active': 'text-primary',
                'is_gl_active': 'active',
                'sidebar': 'internal/general_ledger/accountant_sidebar',
                'account_type_menu_item': 'active',
                'project_name'  : settings.SYSTEM_NAME, 
                'system_name'   : settings.SYSTEM_NAME,
                'system_version': settings.SYSTEM_VERSION
            }
        )

    



""" GET TABLE DATA """

@router.post('/account_type/datatable', status_code=200, response_model=AccountTypeGetForTable, response_model_exclude_none=True) 
async def get_table_data(
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        return account_type.get_table_data(data)
    




""" CREATE """

@router.post("/account_type", status_code=201) 
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
        return account_type.create(data)





""" VALIDATE """

@router.get('/account_type/validate', status_code=200)
async def validate(
    column: str,
    value: str,
    closest: str,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return account_type.validate(column, value, closest)




    
""" GET ONE """

@router.get('/account_type/{account_type_id}', status_code=200, response_model=AccountTypeGetAll, response_model_exclude_none=True)
async def get_one(
    account_type_id: str, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return account_type.get_one(account_type_id)





""" GET ALL """

@router.get('/account_types', status_code=200, response_model=List[AccountTypeGetForSelect])
async def get_all(
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return account_type.get_all()



    
    
""" UPDATE """

@router.post('/account_type/{account_type_id}', status_code=200)
async def update(
    account_type_id: str,
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        data['updated_by'] = result['user'].user_id
        return account_type.update(account_type_id, data)
   




""" DEACTIVATE / ACTIVATE """

@router.delete('/account_type/{account_type_id}', status_code=200)
async def de_activate(
    account_type_id: str, 
    operation_type: int, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return account_type.de_activate(account_type_id, operation_type, result['user'].user_id)