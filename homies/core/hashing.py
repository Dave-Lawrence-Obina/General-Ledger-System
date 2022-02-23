# module
from passlib.context import CryptContext 

# an instance to hash & verify password
pwd_ctx = CryptContext(schemes=['bcrypt'], deprecated='auto')

class Hasher:
    
    # bcrypt password
    def bcrypt(self, password: str):
        return pwd_ctx.hash(password)
    
    # verify password
    def verify(self, plain_password: str, hashed_password: str):
        return pwd_ctx.verify(plain_password, hashed_password)

# class instance
hasher = Hasher()