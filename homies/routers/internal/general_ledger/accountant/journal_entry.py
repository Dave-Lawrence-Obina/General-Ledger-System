# module
from fastapi import APIRouter, Request, Depends, responses
from fastapi.responses import HTMLResponse
from typing import List, Optional

# homies 
from homies.routers.__init__ import templates
from homies.core import security
#from homies.schemas.recruitment_management.user import UserGet 
from homies.schemas.general_ledger.journal_entry import JournalEntryGetForTable, JournalEntryGetAll, JournalEntryGetForSelect 
from homies.controllers.internal.general_ledger.accountant import journal_entry
from homies.core.config import settings

# router for general_journal
router = APIRouter(
    prefix='/general_ledger/accountant',
    tags=['GeneralJournal'],
    include_in_schema=False
)





""" REDIRECT TO 'general_journal' """

@router.get('/general_journal', status_code=200, response_class=HTMLResponse)
async def redirect_to_general_journal(
    request: Request, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return templates.TemplateResponse("pages/internal/general_ledger/accountant/general_journal.html", 
            {
                'request'       : request,
                'browser_title' : 'General Journal | General Ledger',
                'content_title' : 'General Journal', 
                'content_subtitle': 'General Ledger/General Journal',
                'home_url': '../../index',
                'is_finance_active': 'text-primary',
                'is_gl_active': 'active',
                'sidebar': 'internal/general_ledger/accountant_sidebar',
                'general_journal_menu_item': 'active',
                'project_name'  : settings.SYSTEM_NAME, 
                'system_name'   : settings.SYSTEM_NAME,
                'system_version': settings.SYSTEM_VERSION
            }
        )

    



""" GET TABLE DATA """

@router.post('/general_journal/datatable', status_code=200, response_model=JournalEntryGetForTable, response_model_exclude_none=True) 
async def get_table_data(
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        return journal_entry.get_table_data(data)




    
""" CREATE """

@router.post("/general_journal", status_code=201) 
async def create(
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        return journal_entry.create(data, result['user'].user_id)





""" VALIDATE """

@router.get('/general_journal/validate', status_code=200)
async def validate(
    originating_entry: str,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return journal_entry.validate(originating_entry)





""" GET ONE """

@router.get('/general_journal/{id}', status_code=200, response_model=JournalEntryGetAll, response_model_exclude_none=True)
async def get_one(
    id: str,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return journal_entry.get_one(id)





""" GET ALL """

@router.get('/journal_entries', status_code=200, response_model=List[JournalEntryGetForSelect])
async def get_all(
    period: str,
    adjustable: Optional[bool] = None,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return journal_entry.get_all(period, adjustable)





""" UPDATE """

@router.post('/general_journal/{id}', status_code=200)
async def update(
    id: str,
    request: Request,
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        # parse json to dict
        data = await request.json()
        return journal_entry.update(id, data, result['user'].user_id)





""" DEACTIVATE / ACTIVATE """

@router.delete('/general_journal/{id}', status_code=200)
async def de_activate(
    id: str, 
    operation_type: int, 
    result = Depends(security.auth)
):
    try:
        return responses.RedirectResponse(result['url'], status_code=302)
    except:
        return journal_entry.de_activate(id, operation_type, result['user'].user_id)

