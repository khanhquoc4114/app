from sqlalchemy.orm import Session
from models import Notification

def create_notification(
    db: Session,
    user_id: int,
    type: str,
    title: str,
    message: str,
    priority: str = "medium",
    data: dict = None
):
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        priority=priority,
        data=data or {}
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification