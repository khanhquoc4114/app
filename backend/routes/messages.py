from datetime import datetime
from models import *
from sqlalchemy import or_, and_
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, get_current_user_ws  
from services.connection_manager import manager
from fastapi import Query
from pydantic import BaseModel

router = APIRouter(prefix="/api/messages", tags=["Messages"])

class MessageSendRequest(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    created_at: datetime

    class Config:
        orm_mode = True
                
class MessageCreate(BaseModel):
    conversation_id: int
    content: str

@router.post("/send", response_model=MessageResponse)
def send_message(
    payload: MessageSendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    receiver = db.query(User).filter(User.id == payload.receiver_id).first()
    if not receiver:
        raise HTTPException(404, "Receiver not found")

    msg = Message(
        sender_id=current_user.id,
        receiver_id=payload.receiver_id,
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg
      
@router.get("/history/{user_id}")
def get_chat_history(
    user_id: int,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Kiểm tra user target
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(404, "User not found")

    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(
                    Message.sender_id == current_user.id,
                    Message.receiver_id == user_id
                ),
                and_(
                    Message.sender_id == user_id,
                    Message.receiver_id == current_user.id
                )
            )
        )
        .order_by(Message.created_at.asc())  # ASC để có thứ tự đúng
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    # Convert to dict để frontend dễ xử lý
    return [
        {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "content": msg.content,
            "created_at": msg.created_at.isoformat(),
            "is_read": msg.is_read
        }
        for msg in messages
    ]

@router.put("/mark-read/{user_id}")
def mark_messages_as_read(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db.query(Message).filter(
        Message.sender_id == user_id,
        Message.receiver_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    return {"message": "Messages marked as read"}

