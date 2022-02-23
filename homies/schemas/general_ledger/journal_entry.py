# module
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# recruitment_management
from homies.schemas.recruitment_management.user import CreatorUpdater
#from general_ledger.schemas.account_type import AccountTypeBase

class JournalEntryBase(BaseModel):
    date: str
    explanation: Optional[str] = None
    adjustable: bool
    status: str
    entry_type: str

class AccountType(BaseModel):
    name: str

    class Config():
        orm_mode = True        

class ChartAccount(BaseModel):
    chart_account_id: str
    account_title: str
    ca_account_type: AccountType

    class Config():
        orm_mode = True

class JournalAccount(BaseModel):
    id: str
    debit: str
    credit: str 
    pr: int
    ja_account_title: ChartAccount

    class Config():
        orm_mode = True

class OriginatingEntryGetAll(JournalEntryBase):
    id: str
    je_journal_accounts: List[JournalAccount] = []
    method: Optional[str] = None
    balance: str
    journalized_at: datetime 
    posted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None       
    je_journalized_by: CreatorUpdater        
    je_posted_by: Optional[CreatorUpdater] = None 
    je_updated_by: Optional[CreatorUpdater] = None 

    class Config():
        orm_mode = True

class JournalEntryGetAll(JournalEntryBase):
    id: str
    je_journal_accounts: List[JournalAccount] = []
    je_originating_entry: Optional[OriginatingEntryGetAll] = None
    method: Optional[str] = None
    balance: str
    journalized_at: datetime 
    posted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None       
    je_journalized_by: CreatorUpdater        
    je_posted_by: Optional[CreatorUpdater] = None 
    je_updated_by: Optional[CreatorUpdater] = None 

    class Config():
        orm_mode = True

class JournalEntryGet(JournalEntryBase):
    entry: str
    originating_entry: Optional[str] = None
    account_title: str
    pr: int
    debit: str
    credit: str

    class Config():
        orm_mode = True
        
class JournalEntryGetForTable(BaseModel):
    draw: int
    recordsTotal: int
    recordsFiltered: int
    data: List[JournalEntryGet] = []

    class Config():
        orm_mode = True
        
class JournalEntryGetForSelect(BaseModel):
    id: str
    text: str
           
    class Config():
        orm_mode = True