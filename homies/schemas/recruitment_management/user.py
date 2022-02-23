# module
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    profile_pic_url: Optional[str] = None
    last_name:                str
    first_name:               str
    middle_name:     Optional[str] = None
    email:                    EmailStr
    mobile:                   str
    landline:        Optional[str] = None
    user_type:       Optional[str] = None
    status:          Optional[str] = None

class UserGet(BaseModel):
    user_id: str
    user_type: str
    email: EmailStr
    class Config():
        orm_mode = True

class CreatorUpdater(BaseModel):
    user_id:              str
    first_name:           str
    last_name:            str
    middle_name: Optional[str] = None

    class Config():
        orm_mode = True

