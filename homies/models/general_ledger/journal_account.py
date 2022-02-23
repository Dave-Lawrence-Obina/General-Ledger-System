# module
from sqlalchemy import Column, ForeignKey, text
from sqlalchemy.dialects.mysql import CHAR, VARCHAR, TIMESTAMP, SMALLINT, DECIMAL
from sqlalchemy import func
from sqlalchemy.orm import relationship

# homies 
from homies.models.__init__ import Base



""" define & collect JOURNAL ACCOUNT MODEL """

class JournalAccount(Base): 
    __tablename__ = 'journal_accounts'
    id = Column(CHAR(36), primary_key=True)
    debit = Column(DECIMAL(13,2), nullable=False, server_default='0')
    credit = Column(DECIMAL(13,2), nullable=False, server_default='0')
    pr = Column(SMALLINT, nullable=False)
   
    account_title = Column(CHAR(36), ForeignKey("chart_accounts.chart_account_id"))
    journal_entry = Column(CHAR(36), ForeignKey("journal_entries.id"))

    ja_account_title = relationship("ChartAccount", foreign_keys=[account_title])  
    #ja_journal_entry = relationship("JournalEntry", foreign_keys=[journal_entry])  
    
    mysql_engine = 'InnoDB'
    mysql_charset = 'utf8mb4'
    #mysql_key_block_size = "1024"

