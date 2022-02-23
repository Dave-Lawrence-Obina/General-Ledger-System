# module
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# recruitment_management
from homies.schemas.recruitment_management.user import CreatorUpdater

class AccountTypeBase(BaseModel):
    name: str
    code: int
    description: Optional[str] = None
        
class AccountTypeCreate(AccountTypeBase):
    created_by: str

class AccountTypeUpdate(AccountTypeBase):
    updated_by: str
        
class AccountTypeGet(AccountTypeBase):
    status: str
    account_type_id: str

    class Config():
        orm_mode = True
        
class AccountTypeGetAll(AccountTypeBase):
    account_type_id: str
    status: str
    created_at: datetime 
    updated_at: Optional[datetime] = None       
    at_created_by: CreatorUpdater        
    at_updated_by: Optional[CreatorUpdater] = None 

    class Config():
        orm_mode = True

class AccountTypeGetForTable(BaseModel):
    draw: int
    recordsTotal: int
    recordsFiltered: int
    data: List[AccountTypeGet] = []

    class Config():
        orm_mode = True
        
class AccountTypeGetForSelect(BaseModel):
    id: str
    text: str
    code: int
           
    class Config():
        orm_mode = True