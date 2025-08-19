
// 3. Các hàm xử lý logic cho MyBookingsPage
import { Modal, message } from 'antd';

// Xử lý khi người dùng bấm huỷ đặt sân
export const handleCancelBooking = (record) => {
    Modal.confirm({
        title: 'Xác nhận hủy đặt sân',
        content: `Bạn có chắc muốn hủy đặt sân ${record.id}? Phí hủy có thể được áp dụng.`,
        okText: 'Hủy đặt sân',
        cancelText: 'Không',
        onOk: () => {
            message.success(`Đã hủy đặt sân ${record.id}`);
        }
    });
};

// Định dạng số tiền sang VND
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

// Lấy màu cho trạng thái booking
export const getStatusColor = (status) => {
    const colors = {
        confirmed: 'green',
        pending: 'orange',
        completed: 'blue',
        cancelled: 'red'
    };
    return colors[status] || 'default';
};

// Lấy text cho trạng thái booking
export const getStatusText = (status) => {
    const texts = {
        confirmed: 'Đã xác nhận',
        pending: 'Chờ xác nhận',
        completed: 'Đã hoàn thành',
        cancelled: 'Đã hủy'
    };
    return texts[status] || status;
};

// Xử lý khi người dùng bấm đánh giá sân
export const handleReviewBooking = (record, setSelectedBooking, setReviewModalVisible) => {
    setSelectedBooking(record);
    setReviewModalVisible(true);
};

// Xử lý khi gửi đánh giá
export const handleSubmitReview = (setReviewModalVisible, setRating, setReview) => {
    message.success('Cảm ơn bạn đã đánh giá!');
    setReviewModalVisible(false);
    setRating(5);
    setReview('');
};