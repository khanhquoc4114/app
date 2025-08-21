// hostDashboardLogic.js - Chứa các hàm xử lý logic cho hostDashboard
import { message } from 'antd';

// Hàm xử lý xác nhận check-in
export const handleCheckIn = (record, setTodayBookings) => {
    setTodayBookings(prev =>
        prev.map(item =>
            item.key === record.key ? { ...item, checkedIn: true } : item
        )
    );
    message.success(`Khách hàng ${record.customer} đã check-in thành công!`);
};

// Hàm xử lý huỷ booking
export const handleCancelBooking = (record, setTodayBookings) => {
    setTodayBookings(prev => prev.filter(item => item.key !== record.key));
    message.success(`Đã huỷ đặt sân ${record.id}`);
};

// Hàm format tiền
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};
