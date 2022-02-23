# module
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

# homies
from homies.core.config import settings

# database url
DATABASE_URL = settings.DATABASE_URL #'mysql+pymysql://root@localhost:3306/general_ledger'

# reference to database w/ character set configuration
engine = create_engine(DATABASE_URL, connect_args={"charset":"utf8mb4"})

# bind session to database engine
session_factory = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# session registry
session = scoped_session(session_factory)

