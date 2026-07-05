from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, utils

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token:str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code= status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate":"Bearer"},
    )
    try:
        payload = jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        user_id:int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="Token Expired.Please login again")
    except jwt.PyJWTError:
        raise credentials_exception
    
    user= db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user
def get_organizer_user(current_user:models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.organizer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be an Event Organizer to perform this action."
        )
    return current_user