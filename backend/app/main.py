from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import user, auth, event, booking
# Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

app=FastAPI(
    title="Event Booking API",
    description="Multi-Tenant Event Management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(auth.router) 
app.include_router(event.router) 
app.include_router(booking.router)  



@app.get("/",tags=["health"])
def health_check():
    return{
        "status":"online",
        "message":"Welcome to the Event Hub API!"
    }