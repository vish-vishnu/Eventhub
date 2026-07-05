from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models,schemas,utils,dependencies

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)
@router.post("/signup", status_code=status.HTTP_201_CREATED,response_model=schemas.UserResponse)
def create_user(user:schemas.UserCreate, db:Session=Depends(get_db)):
    existing_user=db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_pwd=utils.hash_password(user.password)

    new_user = models.User(
        email = user.email,
        password_hash = hashed_pwd,
        full_name = user.full_name,
        role = user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=schemas.UserResponse)
def get_my_profile(current_user:models.User = Depends(dependencies.get_current_user)):
    return current_user

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(dependencies.get_current_user)):
    """Returns the profile of the currently logged-in user."""
    return current_user