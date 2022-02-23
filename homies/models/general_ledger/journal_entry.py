# module
from sqlalchemy import Column, ForeignKey, text
from sqlalchemy.dialects.mysql import CHAR, VARCHAR, TIMESTAMP, SMALLINT, DECIMAL, BOOLEAN
from sqlalchemy import func
from sqlalchemy.orm import relationship

# homies 
from homies.models.__init__ import Base



""" define & collect JOURNAL ENTRY MODEL """

class JournalEntry(Base): 
    __tablename__ = 'journal_entries'
    id = Column(CHAR(36), primary_key=True)
    entry_type = Column(VARCHAR(50), nullable=False, server_default="Initial")
    date = Column(CHAR(10), nullable=False)
    explanation = Column(VARCHAR(65535))
    adjustable = Column(BOOLEAN, nullable=False, server_default='0')
    method = Column(VARCHAR(50))
    balance = Column(DECIMAL(13,2), nullable=False, server_default='0')

    originating_entry = Column(CHAR(36), ForeignKey("journal_entries.id"))

    status = Column(VARCHAR(50), nullable=False, server_default="Journalized")
    journalized_at = Column(TIMESTAMP(2), nullable=False, server_default=func.current_timestamp())
    posted_at = Column(TIMESTAMP(2))
    updated_at = Column(TIMESTAMP(2), server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    journalized_by = Column(CHAR(36), ForeignKey("users.user_id"))
    posted_by = Column(CHAR(36), ForeignKey("users.user_id"))
    updated_by = Column(CHAR(36), ForeignKey("users.user_id"))

    je_journal_accounts = relationship("JournalAccount")
    je_originating_entry = relationship("JournalEntry", remote_side=id, foreign_keys=[originating_entry])
    je_journalized_by = relationship("User", foreign_keys=[journalized_by])
    je_posted_by = relationship("User", foreign_keys=[posted_by])
    je_updated_by = relationship("User", foreign_keys=[updated_by])
    
    mysql_engine = 'InnoDB'
    mysql_charset = 'utf8mb4'
    #mysql_key_block_size = "1024"

