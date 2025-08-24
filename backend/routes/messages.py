from datetime import datetime
from models import *
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user, get_current_user_ws  
from services.connection_manager import manager
from fastapi import WebSocket
from pydantic import BaseModel

router = APIRouter(prefix="/api/messages", tags=["Messages"])

class MessageSendRequest(BaseModel):
    receiver_id: int
    content: str

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
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
    # 1. check receiver tồn tại
    receiver = db.query(User).filter(User.id == payload.receiver_id).first()
    if not receiver:
        raise HTTPException(404, "Receiver not found")

    # 2. tìm conversation đã có giữa 2 user chưa
    subq = (
        db.query(Conversation.id)
        .join(ConversationParticipant)
        .filter(ConversationParticipant.user_id.in_([current_user.id, payload.receiver_id]))
        .group_by(Conversation.id)
        .having(func.count(Conversation.id) == 2)  # cả 2 user đều nằm trong
        .subquery()
    )
    conversation = db.query(Conversation).filter(Conversation.id.in_(subq)).first()

    # 3. nếu chưa có thì tạo mới
    if not conversation:
        conversation = Conversation()
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

        db.add_all([
            ConversationParticipant(conversation_id=conversation.id, user_id=current_user.id),
            ConversationParticipant(conversation_id=conversation.id, user_id=payload.receiver_id)
        ])
        db.commit()

    # 4. tạo message
    msg = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        content=payload.content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return msg
      
async def notify_users_in_conversation(conversation_id: int, msg: Message, db: Session):
    # Lấy tất cả participants
    participants = db.query(ConversationParticipant).filter(
        ConversationParticipant.conversation_id == conversation_id
    ).all()

    # Tạo payload gửi đi
    payload = {
        "conversation_id": conversation_id,
        "message_id": msg.id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "created_at": str(msg.created_at)
    }

    # Gửi tới tất cả participants qua WebSocket
    for p in participants:
        if p.user_id != msg.sender_id:  # không gửi lại cho chính sender
            await manager.send_personal_message(payload, p.user_id)
