# module
from sqlalchemy import Column, ForeignKey, text
from sqlalchemy.dialects.mysql import CHAR, VARCHAR, TIMESTAMP, SMALLINT
from sqlalchemy import func
from sqlalchemy.orm import relationship

# homies 
from homies.models.__init__ import Base



""" define & collect ACCOUNT TYPE MODEL """

class AccountType(Base): 
    __tablename__ = 'account_types'
    account_type_id = Column(CHAR(36), primary_key=True)
    name = Column(VARCHAR(255), nullable=False, unique=True, index=True)
    code = Column(SMALLINT, nullable=False, unique=True)
    description = Column(VARCHAR(65535))
   
    status = Column(VARCHAR(50), nullable=False, server_default="Active")
    created_at = Column(TIMESTAMP(2), nullable=False, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP(2), server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    created_by = Column(CHAR(36), ForeignKey("users.user_id"))
    updated_by = Column(CHAR(36), ForeignKey("users.user_id"))

    at_created_by = relationship("User", foreign_keys=[created_by])
    at_updated_by = relationship("User", foreign_keys=[updated_by])
    
    mysql_engine = 'InnoDB'
    mysql_charset = 'utf8mb4'
    #mysql_key_block_size = "1024"

