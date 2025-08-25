from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import get_db, oauth2_scheme, verify_token, get_current_user
from models import UserFavorite
from models import User

router = APIRouter(
    prefix="/api/me",
    tags=["me"]
)

@router.get("/favorites")
def get_favorites(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
    user_id = payload["id"]

    favorites = db.query(UserFavorite.facility_id).filter(UserFavorite.user_id == user_id).all()
    return [f.facility_id for f in favorites]