from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse, JSONResponse
import asyncio, json
from payos import PayOS, ItemData, PaymentData
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Booking, User
from auth import get_current_user
from dotenv import load_dotenv
import os
import time
import qrcode
import base64
from io import BytesIO
from datetime import datetime
from typing import List, Optional, Dict

router = APIRouter(prefix="/api/payment", tags=["Payment"])

# Load environment variables
load_dotenv(dotenv_path="../.env")

# Initialize PayOS
payos = PayOS(
    os.getenv("PAYOS_CLIENT_ID"),
    os.getenv("PAYOS_API_KEY"), 
    os.getenv("PAYOS_CHECKSUM_KEY")
)

YOUR_DOMAIN = "http://localhost:3000"
payment_status_cache: Dict[str, dict] = {}

class BookingPaymentData(BaseModel):
    order_code: str  
    facility_name: str
    sport_type: str
    booking_date: str
    total_price: float


@router.post("/create-payment-link")
async def create_payment_link(
    booking_data: BookingPaymentData,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        
        # Lấy order_code từ frontend
        order_code = booking_data.order_code
        
        # Create payment data
        item = ItemData(
            name=f"Đặt sân {booking_data.facility_name}",
            quantity=1,
            price=int(booking_data.total_price)
        )
        
        payment_data = PaymentData(
            orderCode=int(order_code),
            amount=2000,  # hoặc booking_data.total_price nếu muốn đúng
            description=f"Đặt sân {booking_data.sport_type}",
            items=[item],
            cancelUrl=f"{YOUR_DOMAIN}/payment?status=cancelled&order={order_code}",
            returnUrl=f"{YOUR_DOMAIN}/payment?status=success&order={order_code}",
        )
        
        # Create payment link
        payment_response = payos.createPaymentLink(payment_data)
        
        # Generate QR code
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
        qr.add_data(payment_response.qrCode)
        qr.make(fit=True)
        
        qr_image = qr.make_image(fill_color="black", back_color="white")
        buffer = BytesIO()
        qr_image.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "success": True,
            "qr_code_image": f"data:image/png;base64,{qr_base64}",
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment error: {str(e)}")

@router.post("/webhook")
async def payment_webhook(request: Request):
    result = {}
    try:
        body = await request.json()
        # Verify webhook data với PayOS
        webhook_data = payos.verifyPaymentWebhookData(body)
        print("Verified webhook:", webhook_data)

        # Lấy order_code từ webhook
        order_code = str(getattr(webhook_data, 'orderCode', 'unknown'))

        # Kiểm tra success từ webhook_data
        if webhook_data and webhook_data.code == '00' and webhook_data.desc.lower() == 'success':
            payment_status_cache[order_code] = {
                "status": "success",
                "order_code": order_code,
                "amount": getattr(webhook_data, 'amount', 0),
                "message": "Thanh toán thành công!"
            }
            print(f"✅ Payment SUCCESS: Order {order_code}")
        else:
            payment_status_cache[order_code] = {
                "status": "failed",
                "order_code": order_code,
                "amount": getattr(webhook_data, 'amount', 0),
                "message": "Thanh toán thất bại!"
            }
            print(f"❌ Payment FAILED: Order {order_code}")

        result = payment_status_cache[order_code]

    except Exception as e:
        print(f"❌ Error verifying webhook: {e}")
        result = {
            "status": "error",
            "message": str(e)
        }

    return JSONResponse(content=result, status_code=200)

@router.get("/check-status/{order_code}")
async def check_payment_status(order_code: str):
    """
    Endpoint để frontend polling trạng thái thanh toán
    """
    try:
        # Kiểm tra trong cache trước
        if order_code in payment_status_cache:
            cached_status = payment_status_cache[order_code]
            print(f"📋 Returning cached status for order {order_code}: {cached_status['status']}")
            return cached_status
        
        # Nếu chưa có trong cache, trả về pending
        return {
            "status": "pending",
            "order_code": order_code,
            "message": "Đang chờ thanh toán..."
        }
        
    except Exception as e:
        return {
            "status": "error",
            "order_code": order_code,
            "message": str(e)
        }
