# module
from pydantic import BaseModel
from typing import Optional, List

class LedgerAccountGet(BaseModel):
    account_number: int
    account_title: str
    date: str
    explanation: Optional[str] = None
    debit: str
    credit: str
    status: str
    entry: str
    
    class Config():
        orm_mode = True
        
class LedgerAccountGetForTable(BaseModel):
    draw: int
    recordsTotal: int
    recordsFiltered: int
    data: List[LedgerAccountGet] = []

    class Config():
        orm_mode = True

        
