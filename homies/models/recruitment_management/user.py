# module
from sqlalchemy import Column, ForeignKey
from sqlalchemy.dialects.mysql import CHAR, VARCHAR, TIMESTAMP
from sqlalchemy import func
from sqlalchemy.orm import relationship

# homies 
from homies.models.__init__ import Base



""" define & collect USER MODEL """

class User(Base): 
    __tablename__      = 'users'
    user_id            = Column(CHAR(36),     primary_key=True)
    profile_pic_url    = Column(VARCHAR(255))   
    email              = Column(VARCHAR(255), nullable=False, unique=True, index=True)
    password           = Column(VARCHAR(255), nullable=False)
    mobile             = Column(VARCHAR(50),  nullable=False, unique=True)
    landline           = Column(VARCHAR(50))
    first_name         = Column(VARCHAR(50),  nullable=False)
    last_name          = Column(VARCHAR(50),  nullable=False)
    middle_name        = Column(VARCHAR(50))
    user_type          = Column(VARCHAR(50),  nullable=False, server_default="Admin")
   
    status             = Column(VARCHAR(50),  nullable=False, server_default="Active")
    created_at         = Column(TIMESTAMP(2), nullable=False, server_default=func.current_timestamp())
    updated_at         = Column(TIMESTAMP(2),                       onupdate=func.current_timestamp())
    created_by         = Column(CHAR(36),     ForeignKey("users.user_id"))
    updated_by         = Column(CHAR(36),     ForeignKey("users.user_id"))

    u_created_by        = relationship("User", remote_side=user_id, foreign_keys=[created_by])
    u_updated_by        = relationship("User", remote_side=user_id, foreign_keys=[updated_by])
    
    mysql_engine           = 'InnoDB'
    mysql_charset          = 'utf8mb4'
    #mysql_key_block_size="1024"

