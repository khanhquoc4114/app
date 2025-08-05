from fastapi import FastAPI
from . import models
from .database import engine
from .routes import router
from fastapi.middleware.cors import CORSMiddleware


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc thay bằng domain cụ thể, ví dụ ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/todos", tags=["Todos"])

@app.get("/")
def root():
    return {"message": "Todo Service is running"}
