from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import requests, os
from . import models, schemas, database

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://auth-service:8000/login")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000/auth")

def get_current_user(token: str = Depends(oauth2_scheme)):
    verify_url = f"{AUTH_SERVICE_URL}/verify"
    try:
        response = requests.post(verify_url, headers={"Authorization": f"Bearer {token}"}, timeout=5)
        print(response)
    except requests.exceptions.RequestException:
        raise HTTPException(status_code=503, detail="Auth service unavailable")

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")
    return response.json()

@router.post("/", response_model=schemas.TodoResponse)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(database.get_db), current_user: dict = Depends(get_current_user)):
    new_todo = models.Todo(title=todo.title, description=todo.description, user_id=current_user["user_id"])
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo

@router.get("/", response_model=list[schemas.TodoResponse])
def get_todos(db: Session = Depends(database.get_db), current_user: dict = Depends(get_current_user)):
    return db.query(models.Todo).filter(models.Todo.user_id == current_user["user_id"]).all()
