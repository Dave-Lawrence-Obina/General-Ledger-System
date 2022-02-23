# module
from fastapi import APIRouter

# public 
from homies.routers.public import index as public_index, find_doctor, login
# internal 
from homies.routers.internal import index as internal_index, system_admin
# general_ledger > accountant
from homies.routers.internal.general_ledger.accountant import dashboard as accountant_dashboard, account_type, chart_account, ledger_account, journal_entry
# general_ledger > internal_user
from homies.routers.internal.general_ledger.internal_user import dashboard as internal_user_dashboard

# base router to include all routers
base_router = APIRouter()

""" public """
# public_index router
base_router.include_router(public_index.router)
# find_doctor router
base_router.include_router(find_doctor.router)
# login router
base_router.include_router(login.router)

""" internal """
# internal_index router
base_router.include_router(internal_index.router)
# system_admin router
base_router.include_router(system_admin.router)

""" general_ledger > accountant """
# accountant_dashboard router
base_router.include_router(accountant_dashboard.router)
# account_type router
base_router.include_router(account_type.router)
# chart_account router
base_router.include_router(chart_account.router)
# ledger_account router
base_router.include_router(ledger_account.router)
# journal_entry router
base_router.include_router(journal_entry.router)

""" general_ledger > internal_user """
# internal_user_dashboard router
base_router.include_router(internal_user_dashboard.router)