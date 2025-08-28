from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from payos import PayOS, ItemData, PaymentData
from dotenv import load_dotenv
import os
import time

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3030"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables from .env file
load_dotenv(dotenv_path="../.env")

# Get PayOS credentials from environment variables
client_id = os.getenv("PAYOS_CLIENT_ID")
api_key = os.getenv("PAYOS_API_KEY") 
checksum_key = os.getenv("PAYOS_CHECKSUM_KEY") 

payos = PayOS(client_id, api_key, checksum_key)

YOUR_DOMAIN = "http://localhost:3030"

@app.post("/create-payment-link")
async def create_payment_link():
    try:
        # Tạo item data
        item = ItemData(name="Mì tôm hảo hảo ly", quantity=1, price=10000)
        
        # Tạo payment data
        payment_data = PaymentData(
            orderCode=int(time.time()),
            amount=10000,
            description="Thanh toan don hang",
            items=[item],
            cancelUrl=YOUR_DOMAIN + "?canceled=true",
            returnUrl=YOUR_DOMAIN + "?success=true",
        )
        
        # Tạo payment link
        payment_link_response = payos.createPaymentLink(payment_data)
        
        # Redirect đến checkout URL
        return RedirectResponse(url=payment_link_response.checkoutUrl)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Thêm endpoint để xử lý callback từ PayOS
@app.get("/success")
async def payment_success():
    return {"message": "Payment successful"}

@app.get("/cancel")
async def payment_cancel():
    return {"message": "Payment cancelled"}
