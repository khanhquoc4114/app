from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class BookingCreate(BaseModel):
    facility_id: int
    sport_type: str
    court_id: int 
    booking_date: datetime
    start_time: datetime
    end_time: datetime
    time_slots: List[str]
    total_price: float
    notes: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class FacilityBase(BaseModel):
    name: str
    sport_type: str
    description: Optional[str] = None
    price_per_hour: float
    image_url: Optional[str] = None
    address: str
    ward: str
    district: str
    city: str
    full_address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FacilityCreate(FacilityBase):
    pass

class FacilityResponse(FacilityBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
class LoginRequest(BaseModel):
    username: str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    
class UserOut(BaseModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    is_active: bool
    total_bookings: int
    total_spent: float
    created_at: datetime

    class Config:
        orm_mode = True
        
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
    
class VerifyTokenResponse(BaseModel):
    valid: bool
    message: str
    user_id: Optional[int] = None