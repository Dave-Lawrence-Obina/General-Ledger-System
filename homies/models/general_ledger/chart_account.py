# module
from sqlalchemy import Column, ForeignKey, text
from sqlalchemy.dialects.mysql import CHAR, VARCHAR, TIMESTAMP, SMALLINT, DECIMAL
from sqlalchemy import func
from sqlalchemy.orm import relationship

# homies 
from homies.models.__init__ import Base



""" define & collect CHART ACCOUNT MODEL """

class ChartAccount(Base): 
    __tablename__ = 'chart_accounts'
    chart_account_id = Column(CHAR(36), primary_key=True)
    account_number = Column(SMALLINT, nullable=False, unique=True)
    account_title = Column(VARCHAR(255), nullable=False, unique=True, index=True)
    description = Column(VARCHAR(65535))

    account_type = Column(CHAR(36), ForeignKey("account_types.account_type_id"))

    status = Column(VARCHAR(50), nullable=False, server_default="Active")
    created_at = Column(TIMESTAMP(2), nullable=False, server_default=func.current_timestamp())
    updated_at = Column(TIMESTAMP(2), server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    created_by = Column(CHAR(36), ForeignKey("users.user_id"))
    updated_by = Column(CHAR(36), ForeignKey("users.user_id"))

    ca_account_type = relationship("AccountType", foreign_keys=[account_type])  
    ca_created_by = relationship("User", foreign_keys=[created_by])
    ca_updated_by = relationship("User", foreign_keys=[updated_by])
    
    mysql_engine = 'InnoDB'
    mysql_charset = 'utf8mb4'
    #mysql_key_block_size = "1024"

