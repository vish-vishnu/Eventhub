from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from app.models import RoleEnum

class UserCreate(BaseModel):
    email:EmailStr
    password:str
    full_name:str
    role:RoleEnum = RoleEnum.organizer

class UserResponse(BaseModel):
    id:int
    email:EmailStr
    full_name:str
    role:RoleEnum

    model_config = ConfigDict(from_attributes=True)
    
class USerLogin(BaseModel):
    email:EmailStr
    password:str

class Token(BaseModel):
    access_token:str
    token_type:str

class EventCreate(BaseModel):
    title:str
    description:str | None
    date:datetime
    capacity:int

class EventResponse(BaseModel):
    id:int
    title:str
    description:str | None
    date:datetime
    capacity:int
    organizer_id:int

    model_config= ConfigDict(from_attributes=True)

class BookingCreate(BaseModel):
    event_id:int

class BookingResponse(BaseModel):
    id:int
    event_id:int
    user_id:int
    booked_at:datetime

    model_config = ConfigDict(from_attributes=True)

