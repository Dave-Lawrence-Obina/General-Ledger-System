# module
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# recruitment_management
from homies.schemas.recruitment_management.user import CreatorUpdater
#from general_ledger.schemas.account_type import AccountTypeBase

class ChartAccountBase(BaseModel):
    account_title: str
    account_type: str
    account_number: int
    description: Optional[str] = None
        
class ChartAccountCreate(ChartAccountBase):
    created_by: str

class ChartAccountUpdate(ChartAccountBase):
    updated_by: str
        
class ChartAccountGet(ChartAccountBase):
    account_type: str#
    homies_balance: float = 0
    bank_balance: float = 0
    status: str
    chart_account_id: str

    class Config():
        orm_mode = True
        
class ChartAccountGetAll(ChartAccountBase):
    chart_account_id: str
    homies_balance: Optional[float] = None
    bank_balance: Optional[float] = None
    status: str
    created_at: datetime 
    updated_at: Optional[datetime] = None       
    ca_created_by: CreatorUpdater        
    ca_updated_by: Optional[CreatorUpdater] = None 

    class Config():
        orm_mode = True

class ChartAccountGetForTable(BaseModel):
    draw: int
    recordsTotal: int
    recordsFiltered: int
    data: List[ChartAccountGet] = []

    class Config():
        orm_mode = True
        
class ChartAccountGetForSelect(BaseModel):
    id: str
    text: str
           
    class Config():
        orm_mode = True