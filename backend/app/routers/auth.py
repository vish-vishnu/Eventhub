from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas,utils

router = APIRouter(tags=["Authentication"])

@router.post("/login",response_model=schemas.Token)
def login(form_data:OAuth2PasswordRequestForm = Depends(), db:Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not user or not utils.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail="Invalid Credentials"
        )
    
    access_token = utils.create_access_token(data ={"user_id":user.id, "role":user.role.value})

    return {"access_token":access_token, "token_type":"bearer"}