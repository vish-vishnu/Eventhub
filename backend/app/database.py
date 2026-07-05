import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#getting postgresql credentials
SQLALCHEMY_DATABASE_URL=os.getenv("DATABASE_URL","postgresql://postgres:Vishnu2523@localhost:5432/event_booking_db")

#connect with database
engine=create_engine(SQLALCHEMY_DATABASE_URL)

#for individual database session for each API request
SessionLocal=sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base=declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()


