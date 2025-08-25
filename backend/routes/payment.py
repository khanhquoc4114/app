from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import requests
import json
import hashlib
import hmac
import uuid
import time
from datetime import datetime, timedelta
import logging

from database import get_db
from models import Booking, User
from auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic models
class PaymentRequest(BaseModel):
    amount: int
    orderInfo: str
    transactionId: str
    bookingId: int
    facilityId: int
    sportType: str
    courtId: Optional[int] = None
    startTime: str
    endTime: str

class BankPaymentRequest(BaseModel):
    amount: int
    orderInfo: str
    transactionId: str
    bookingId: int
    facilityId: int
    sportType: str
    courtId: Optional[int] = None
    startTime: str
    endTime: str
    bankAccount: str = "0389876420"

class PaymentStatusResponse(BaseModel):
    status: str  # success, failed, pending
    message: str
    transactionId: str
    amount: Optional[int] = None

# MoMo Configuration
MOMO_CONFIG = {
    "partnerCode": "MOMO_PARTNER_CODE",  # Thay bằng partner code thực tế
    "accessKey": "MOMO_ACCESS_KEY",      # Thay bằng access key thực tế
    "secretKey": "MOMO_SECRET_KEY",      # Thay bằng secret key thực tế
    "endpoint": "https://test-payment.momo.vn/v2/gateway/api/create",
    "redirectUrl": "http://localhost:3000/payment/momo/return",
    "ipnUrl": "http://localhost:8000/api/payment/momo/ipn"
}

# MB Bank Configuration (giả lập)
MB_BANK_CONFIG = {
    "account_number": "0389876420",
    "account_name": "NGUYEN VAN A",
    "bank_code": "MB",
    "api_endpoint": "https://api.mbbank.com.vn/payment/check"  # API giả lập
}

# Lưu trữ tạm thời trạng thái thanh toán (trong thực tế nên dùng Redis)
payment_status_cache = {}

def generate_signature(data: dict, secret_key: str) -> str:
    """Tạo chữ ký cho MoMo"""
    raw_signature = f"accessKey={data['accessKey']}&amount={data['amount']}&extraData={data['extraData']}&ipnUrl={data['ipnUrl']}&orderId={data['orderId']}&orderInfo={data['orderInfo']}&partnerCode={data['partnerCode']}&redirectUrl={data['redirectUrl']}&requestId={data['requestId']}&requestType={data['requestType']}"
    return hmac.new(secret_key.encode(), raw_signature.encode(), hashlib.sha256).hexdigest()

@router.post("/momo/create")
async def create_momo_payment(
    payment_request: PaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo thanh toán MoMo"""
    try:
        # Tạo dữ liệu cho MoMo
        order_id = f"MOMO_{payment_request.transactionId}"
        request_id = str(uuid.uuid4())
        
        momo_data = {
            "partnerCode": MOMO_CONFIG["partnerCode"],
            "accessKey": MOMO_CONFIG["accessKey"],
            "requestId": request_id,
            "amount": str(payment_request.amount),
            "orderId": order_id,
            "orderInfo": payment_request.orderInfo,
            "redirectUrl": MOMO_CONFIG["redirectUrl"],
            "ipnUrl": MOMO_CONFIG["ipnUrl"],
            "extraData": json.dumps({
                "bookingId": payment_request.bookingId,
                "facilityId": payment_request.facilityId,
                "userId": current_user.id
            }),
            "requestType": "captureWallet",
            "lang": "vi"
        }
        
        # Tạo chữ ký
        signature = generate_signature(momo_data, MOMO_CONFIG["secretKey"])
        momo_data["signature"] = signature
        
        # Gọi API MoMo (giả lập)
        # response = requests.post(MOMO_CONFIG["endpoint"], json=momo_data)
        
        # Giả lập response thành công
        momo_response = {
            "partnerCode": MOMO_CONFIG["partnerCode"],
            "orderId": order_id,
            "requestId": request_id,
            "amount": payment_request.amount,
            "responseTime": int(time.time() * 1000),
            "message": "Successful.",
            "resultCode": 0,
            "payUrl": f"https://test-payment.momo.vn/v2/gateway/pay?t={order_id}",
            "qrCodeUrl": f"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
        
        # Lưu trạng thái thanh toán
        payment_status_cache[payment_request.transactionId] = {
            "status": "pending",
            "amount": payment_request.amount,
            "orderId": order_id,
            "bookingId": payment_request.bookingId,
            "created_at": datetime.now()
        }
        
        return {
            "success": True,
            "payUrl": momo_response["payUrl"],
            "qrCodeUrl": momo_response["qrCodeUrl"],
            "orderId": order_id,
            "message": "Tạo thanh toán MoMo thành công"
        }
        
    except Exception as e:
        logger.error(f"MoMo payment creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo thanh toán MoMo: {str(e)}")

@router.post("/bank/create")
async def create_bank_payment(
    payment_request: BankPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo thanh toán chuyển khoản ngân hàng"""
    try:
        # Tạo QR code data cho chuyển khoản
        qr_data = {
            "bank": "MB",
            "account": MB_BANK_CONFIG["account_number"],
            "amount": payment_request.amount,
            "description": f"{payment_request.transactionId} {payment_request.orderInfo}",
            "template": "compact"
        }
        
        # Lưu trạng thái thanh toán
        payment_status_cache[payment_request.transactionId] = {
            "status": "pending",
            "amount": payment_request.amount,
            "bookingId": payment_request.bookingId,
            "bank_account": payment_request.bankAccount,
            "created_at": datetime.now()
        }
        
        return {
            "success": True,
            "qrData": qr_data,
            "bankInfo": {
                "bankName": "MB Bank",
                "accountNumber": MB_BANK_CONFIG["account_number"],
                "accountName": MB_BANK_CONFIG["account_name"],
                "amount": payment_request.amount,
                "description": f"{payment_request.transactionId} {payment_request.orderInfo}"
            },
            "message": "Tạo thanh toán ngân hàng thành công"
        }
        
    except Exception as e:
        logger.error(f"Bank payment creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi tạo thanh toán ngân hàng: {str(e)}")

@router.get("/status/{transaction_id}")
async def check_payment_status(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kiểm tra trạng thái thanh toán"""
    try:
        # Kiểm tra trong cache
        if transaction_id not in payment_status_cache:
            return PaymentStatusResponse(
                status="failed",
                message="Không tìm thấy giao dịch",
                transactionId=transaction_id
            )
        
        payment_info = payment_status_cache[transaction_id]
        
        # Giả lập kiểm tra thanh toán từ ngân hàng
        # Trong thực tế, sẽ gọi API ngân hàng để kiểm tra
        
        # Giả lập: sau 10 giây sẽ thành công (để test)
        time_diff = datetime.now() - payment_info["created_at"]
        if time_diff.total_seconds() > 10:  # 10 giây
            payment_info["status"] = "success"
            
            # Cập nhật booking status
            booking = db.query(Booking).filter(Booking.id == payment_info["bookingId"]).first()
            if booking:
                booking.status = "confirmed"
                booking.payment_status = "paid"
                booking.payment_method = "bank" if "bank_account" in payment_info else "momo"
                db.commit()
        
        return PaymentStatusResponse(
            status=payment_info["status"],
            message="Thành công" if payment_info["status"] == "success" else "Đang xử lý",
            transactionId=transaction_id,
            amount=payment_info["amount"]
        )
        
    except Exception as e:
        logger.error(f"Payment status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi kiểm tra trạng thái thanh toán: {str(e)}")

@router.get("/momo/status/{transaction_id}")
async def check_momo_payment_status(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kiểm tra trạng thái thanh toán MoMo"""
    try:
        # Tương tự như check_payment_status nhưng dành riêng cho MoMo
        if transaction_id not in payment_status_cache:
            return PaymentStatusResponse(
                status="failed",
                message="Không tìm thấy giao dịch MoMo",
                transactionId=transaction_id
            )
        
        payment_info = payment_status_cache[transaction_id]
        
        # Giả lập kiểm tra từ MoMo
        time_diff = datetime.now() - payment_info["created_at"]
        if time_diff.total_seconds() > 8:  # 8 giây cho MoMo
            payment_info["status"] = "success"
            
            # Cập nhật booking
            booking = db.query(Booking).filter(Booking.id == payment_info["bookingId"]).first()
            if booking:
                booking.status = "confirmed"
                booking.payment_status = "paid"
                booking.payment_method = "momo"
                db.commit()
        
        return PaymentStatusResponse(
            status=payment_info["status"],
            message="Thanh toán MoMo thành công" if payment_info["status"] == "success" else "Đang xử lý thanh toán MoMo",
            transactionId=transaction_id,
            amount=payment_info["amount"]
        )
        
    except Exception as e:
        logger.error(f"MoMo payment status check error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi kiểm tra trạng thái thanh toán MoMo: {str(e)}")

@router.post("/momo/ipn")
async def momo_ipn_handler(request: dict, db: Session = Depends(get_db)):
    """Xử lý IPN (Instant Payment Notification) từ MoMo"""
    try:
        # Xác thực chữ ký từ MoMo
        # Trong thực tế cần verify signature
        
        order_id = request.get("orderId")
        result_code = request.get("resultCode")
        transaction_id = request.get("transId")
        
        # Tìm transaction trong cache
        for txn_id, payment_info in payment_status_cache.items():
            if payment_info.get("orderId") == order_id:
                if result_code == 0:  # Thành công
                    payment_info["status"] = "success"
                    
                    # Cập nhật booking
                    booking = db.query(Booking).filter(Booking.id == payment_info["bookingId"]).first()
                    if booking:
                        booking.status = "confirmed"
                        booking.payment_status = "paid"
                        booking.payment_method = "momo"
                        booking.transaction_id = transaction_id
                        db.commit()
                else:
                    payment_info["status"] = "failed"
                break
        
        return {"message": "IPN processed successfully"}
        
    except Exception as e:
        logger.error(f"MoMo IPN processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="IPN processing failed")

@router.post("/bank/webhook")
async def bank_webhook_handler(request: dict, db: Session = Depends(get_db)):
    """Webhook từ ngân hàng MB Bank (giả lập)"""
    try:
        # Giả lập webhook từ MB Bank khi có giao dịch
        account_number = request.get("account_number")
        amount = request.get("amount")
        description = request.get("description")
        transaction_time = request.get("transaction_time")
        
        if account_number == MB_BANK_CONFIG["account_number"]:
            # Tìm transaction từ description
            for txn_id, payment_info in payment_status_cache.items():
                if txn_id in description and payment_info["amount"] == amount:
                    payment_info["status"] = "success"
                    
                    # Cập nhật booking
                    booking = db.query(Booking).filter(Booking.id == payment_info["bookingId"]).first()
                    if booking:
                        booking.status = "confirmed"
                        booking.payment_status = "paid"
                        booking.payment_method = "bank"
                        booking.transaction_id = txn_id
                        db.commit()
                    break
        
        return {"message": "Webhook processed successfully"}
        
    except Exception as e:
        logger.error(f"Bank webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Webhook processing failed")

# Background task để cleanup cache cũ
async def cleanup_old_payments():
    """Dọn dẹp các payment cũ trong cache"""
    current_time = datetime.now()
    expired_keys = []
    
    for txn_id, payment_info in payment_status_cache.items():
        if current_time - payment_info["created_at"] > timedelta(hours=1):
            expired_keys.append(txn_id)
    
    for key in expired_keys:
        del payment_status_cache[key]

@router.post("/simulate-bank-payment/{transaction_id}")
async def simulate_bank_payment(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """API giả lập để test thanh toán ngân hàng (chỉ dùng trong development)"""
    try:
        if transaction_id in payment_status_cache:
            payment_info = payment_status_cache[transaction_id]
            payment_info["status"] = "success"
            
            # Cập nhật booking
            booking = db.query(Booking).filter(Booking.id == payment_info["bookingId"]).first()
            if booking:
                booking.status = "confirmed"
                booking.payment_status = "paid"
                booking.payment_method = "bank"
                db.commit()
            
            return {"message": "Thanh toán được giả lập thành công"}
        else:
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch")
            
    except Exception as e:
        logger.error(f"Simulate payment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-payment/{transaction_id}")
async def test_payment_success(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """API test để giả lập thanh toán thành công (chỉ dùng trong development)"""
    try:
        if transaction_id in payment_status_cache:
            payment_info = payment_status_cache[transaction_id]
            payment_info["status"] = "success"
            
            # Cập nhật booking
            booking = db.query(Booking).filter(Booking.id == payment_info["bookingId"]).first()
            if booking:
                booking.status = "confirmed"
                booking.payment_status = "paid"
                booking.payment_method = "test"
                db.commit()
            
            return {"message": "Test payment thành công", "status": "success"}
        else:
            raise HTTPException(status_code=404, detail="Không tìm thấy giao dịch")
            
    except Exception as e:
        logger.error(f"Test payment error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))