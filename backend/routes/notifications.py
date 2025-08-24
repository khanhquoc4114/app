from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import update
from sqlalchemy import case, desc
from database import get_db
from models import Notification
from auth import verify_token, oauth2_scheme, get_current_user_id

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("/")
def get_notifications(
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    priority_order = case(
        (Notification.priority == "high", 1),
        (Notification.priority == "medium", 2),
        (Notification.priority == "low", 3),
        else_=4
    )

    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user_id)
        .order_by(
            Notification.read.asc(),     # chưa đọc (False=0) trước, đã đọc (True=1) sau
            priority_order,              # high -> medium -> low
            desc(Notification.timestamp) # mới nhất trước
        )
        .all()
    )

    return notifications

@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, db: Session = Depends(get_db)):
    result = db.execute(
        update(Notification)
        .where(Notification.id == notification_id)
        .values(read=True)
        .returning(Notification.id, Notification.read)
    )
    row = result.fetchone()
    db.commit()
    if not row:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"id": row.id, "read": row.read}

@router.patch("/mark-all-read")
def mark_all_as_read(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user_id = payload["id"]

    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    ).all()

    for n in notifications:
        n.read = True

    db.commit()
    return {"message": f"{len(notifications)} notifications marked as read"}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")

    user_id = payload["id"]

    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")

    db.delete(notification)
    db.commit()
    return {"message": f"Notification {notification_id} deleted successfully"}