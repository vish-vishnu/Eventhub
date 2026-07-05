import enum
from datetime import datetime
from sqlalchemy import ForeignKey, String, Integer, Text, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column,relationship
from sqlalchemy.sql import func
from app.database import Base

class RoleEnum(str, enum.Enum):
    organizer = "organizer"
    attendee = "attendee"

class User(Base):
    __tablename__ = "users"

    id:Mapped[int] = mapped_column(primary_key=True, index=True)
    email:Mapped[str] = mapped_column(String(255),unique=True, index=True, nullable=False)
    password_hash:Mapped[str] = mapped_column(String(255), nullable=False)
    full_name:Mapped[str] = mapped_column(String(255), nullable=False)

    role:Mapped[RoleEnum] = mapped_column(SQLEnum(RoleEnum),default=RoleEnum.attendee,nullable=False)

    events_created:Mapped[list["Event"]] = relationship("Event", back_populates="organizer", cascade="all, delete-orphan")
    bookings:Mapped[list["Booking"]] = relationship("Booking", back_populates="user", cascade="all, delete-orphan")

class Event(Base):
    __tablename__ = "events"

    id:Mapped[int] = mapped_column(primary_key=True, index=True)
    title:Mapped[str] = mapped_column(String(255), nullable=False)
    description:Mapped[str] = mapped_column(String(255), nullable=True)
    date:Mapped[datetime] = mapped_column(DateTime(timezone=True),nullable=False)
    capacity:Mapped[int] = mapped_column(Integer, nullable=False)
    organizer_id: Mapped[int] = mapped_column(ForeignKey("users.id"),nullable=False)

    organizer:Mapped["User"] = relationship("User", back_populates="events_created")
    bookings:Mapped[list["Booking"]] = relationship("Booking",back_populates="event", cascade="all, delete-orphan")

class Booking(Base):
    __tablename__ = "bookings"

    id:Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id:Mapped[int] = mapped_column(ForeignKey("users.id"),nullable=False)
    event_id:Mapped[int] = mapped_column(ForeignKey("events.id"),nullable=False)
    booked_at:Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(),nullable=False)

    user:Mapped["User"] = relationship("User", back_populates="bookings")
    event:Mapped["Event"] = relationship("Event", back_populates="bookings")