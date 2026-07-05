from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, dependencies

router = APIRouter(prefix="/bookings",tags=["Bookings"])

@router.post("/",status_code=status.HTTP_201_CREATED,response_model=schemas.BookingResponse)
def create_booking(
    booking_data:schemas.BookingCreate,
    db:Session= Depends(get_db),
    current_user:models.User=Depends(dependencies.get_current_user)
):
    event = db.query(models.Event).filter(models.Event.id == booking_data.event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Event not found")
    
    existing_booking = db.query(models.Booking).filter(
        models.Booking.event_id == booking_data.event_id,
        models.Booking.user_id == current_user.id
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already booked a ticket for this event."
        )
    
    new_booking = models.Booking(
        event_id = booking_data.event_id,
        user_id=current_user.id
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking

@router.get("/me",response_model=list[schemas.BookingResponse])
def get_my_bookings(
    db:Session= Depends(get_db),
    current_user:models.User = Depends(dependencies.get_current_user)
):
    my_bookings = db.query(models.Booking).filter(
        models.Booking.user_id == current_user.id
    ).all()

    return my_bookings

@router.delete("/{booking_id}",status_code=status.HTTP_204_NO_CONTENT)
def cancel_booking(
    booking_id:int,
    db:Session= Depends(get_db),
    current_user:models.User = Depends(dependencies.get_current_user)
):
    booking= db.query(models.Booking).filter(models.Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Booking not dfopund")
    
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel someone else's ticket."
        )
    
    db.delete(booking)
    db.commit()

    return 
