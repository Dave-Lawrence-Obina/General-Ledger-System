# module
import dotenv

# load .env file
dotenv_file = dotenv.find_dotenv() 
dotenv.load_dotenv(dotenv_file)

class Settings:
    
    # project properties
    SYSTEM_NAME    = "HoMIES"
    SYSTEM_VERSION = "1.0.0"

    # database properties
    MYSQL_DIALECT  = dotenv.get_key(dotenv_file, "MYSQL_DIALECT")
    MYSQL_DRIVER   = dotenv.get_key(dotenv_file, "MYSQL_DRIVER")
    MYSQL_USERNAME = dotenv.get_key(dotenv_file, "MYSQL_USERNAME")
    MYSQL_PASSWORD = dotenv.get_key(dotenv_file, "MYSQL_PASSWORD")
    MYSQL_SERVER   = dotenv.get_key(dotenv_file, "MYSQL_SERVER")
    MYSQL_PORT     = dotenv.get_key(dotenv_file, "MYSQL_PORT")
    MYSQL_DB       = dotenv.get_key(dotenv_file, "MYSQL_DB")
    DATABASE_URL   = f"{MYSQL_DIALECT}+{MYSQL_DRIVER}://{MYSQL_USERNAME}:{MYSQL_PASSWORD}@{MYSQL_SERVER}:{MYSQL_PORT}/{MYSQL_DB}"

    # token properties
    ACCESS_SECRET_KEY = dotenv.get_key(dotenv_file, "ACCESS_SECRET_KEY") 
    REFRESH_SECRET_KEY = dotenv.get_key(dotenv_file, "REFRESH_SECRET_KEY")
    ALGORITHM = dotenv.get_key(dotenv_file, "ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(dotenv.get_key(dotenv_file, "ACCESS_TOKEN_EXPIRE_MINUTES"))
    REFRESH_TOKEN_EXPIRE_DAYS = int(dotenv.get_key(dotenv_file, "REFRESH_TOKEN_EXPIRE_DAYS"))

# class instance
settings = Settings()

