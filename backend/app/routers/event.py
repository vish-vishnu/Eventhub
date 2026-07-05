from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, dependencies

router = APIRouter(
    prefix="/events",
    tags=["Events"]
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.EventResponse)
def create_event(
    event_data:schemas.EventCreate,
    db:Session=Depends(get_db),
    current_organizer:models.User= Depends(dependencies.get_organizer_user)
):
    new_event = models.Event(
        title=event_data.title,
        description=event_data.description,
        date=event_data.date,
        capacity=event_data.capacity,
        organizer_id=current_organizer.id
    
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event

@router.get("/",response_model=list[schemas.EventResponse])
def get_all_events(db:Session = Depends(get_db)):
    events = db.query(models.Event).all()

    return events

@router.delete("/{event.id}",status_code=status.HTTP_204_NO_CONTENT)
def cancel_event(
    event_id:int,
    db:Session=Depends(get_db),
    current_organizer:models.User = Depends(dependencies.get_organizer_user)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()

    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Event not found")
    
    if event.organizer_id != current_organizer.id:
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail="You can only delete events that you created."
        )
    db.delete(event)
    db.commit()

    return
