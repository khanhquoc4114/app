// Tách logic xử lý chat ra khỏi UI
import dayjs from 'dayjs';
import { RobotOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import ChatMessage from './ChatMessage';

// Câu hỏi nhanh phổ biến
export const quickQuestions = [
    'Giờ mở cửa của sân?',
    'Cách đặt sân?',
    'Chính sách hủy đặt?',
    'Giá thuê sân?',
    'Liên hệ hỗ trợ'
];

// Tạo tin nhắn chào mừng bot
export const getWelcomeMessage = () =>
    new ChatMessage(
        1,
        'bot',
        'Xin chào! Tôi là AI Assistant của hệ thống đặt sân thể thao. Tôi có thể giúp bạn:\n\n• Tìm hiểu về các sân thể thao\n• Hướng dẫn đặt sân\n• Giải đáp thắc mắc\n• Kết nối với nhân viên hỗ trợ\n\nBạn cần hỗ trợ gì?',
        dayjs(),
        <RobotOutlined />
    );

// Sinh phản hồi bot dựa trên input
export function generateBotResponse(userInput) {
    const input = userInput.toLowerCase();
    if (input.includes('giờ') || input.includes('mở cửa')) {
        return 'Hệ thống sân thể thao của chúng tôi mở cửa:\n\n🕕 **Giờ hoạt động:** 06:00 - 22:00 hàng ngày\n🏸 **Sân cầu lông:** 06:00 - 22:00\n⚽ **Sân bóng đá:** 05:00 - 23:00\n🎾 **Sân tennis:** 06:00 - 21:00\n\nBạn có thể đặt sân trực tuyến 24/7!';
    }
    if (input.includes('đặt sân') || input.includes('booking')) {
        return 'Để đặt sân, bạn có thể:\n\n1️⃣ **Trực tuyến:** Vào trang "Danh sách sân" → Chọn sân → Chọn ngày giờ → Đặt sân\n\n2️⃣ **Quy trình:**\n   • Chọn sân phù hợp\n   • Chọn ngày và khung giờ\n   • Điền thông tin liên hệ\n   • Thanh toán online\n   • Nhận xác nhận qua email/SMS\n\n3️⃣ **Lưu ý:** Đặt trước ít nhất 2 tiếng để đảm bảo có sân!';
    }
    if (input.includes('hủy') || input.includes('cancel')) {
        return '**Chính sách hủy đặt sân:**\n\n✅ **Miễn phí hủy:** Trước 24h\n💰 **Phí 50%:** Hủy trong vòng 24h\n❌ **Không hoàn tiền:** Hủy trong vòng 2h\n\n**Cách hủy:**\n• Vào "Lịch đặt của tôi"\n• Chọn lịch cần hủy\n• Nhấn "Hủy đặt"\n• Xác nhận hủy\n\nTiền sẽ được hoàn lại trong 3-5 ngày làm việc!';
    }
    if (input.includes('giá') || input.includes('price')) {
        return '**Bảng giá thuê sân:**\n\n🏸 **Cầu lông:**\n   • Sân thường: 60,000đ/giờ\n   • Sân VIP: 80,000đ/giờ\n\n⚽ **Bóng đá mini:**\n   • Sân 5v5: 200,000đ/giờ\n   • Sân 7v7: 300,000đ/giờ\n\n🎾 **Tennis:** 150,000đ/giờ\n🏀 **Bóng rổ:** 120,000đ/giờ\n\n💡 **Ưu đãi:** Giảm 10% khi đặt từ 3 giờ trở lên!';
    }
    if (input.includes('liên hệ') || input.includes('support')) {
        return '**Thông tin liên hệ:**\n\n📞 **Hotline:** 1900-xxxx (24/7)\n📧 **Email:** support@sportsfacility.com\n💬 **Chat:** Ngay tại đây!\n\n**Địa chỉ các sân:**\n🏢 Chi nhánh 1: Quận 1, TP.HCM\n🏢 Chi nhánh 2: Quận 7, TP.HCM\n🏢 Chi nhánh 3: Quận 3, TP.HCM\n\nBạn muốn tôi kết nối với nhân viên hỗ trợ không?';
    }
    return (
        'Cảm ơn bạn đã liên hệ! Tôi hiểu bạn đang cần hỗ trợ về "' +
        userInput +
        '".\n\nTôi có thể giúp bạn về:\n• Thông tin sân thể thao\n• Hướng dẫn đặt sân\n• Chính sách và quy định\n• Giá cả và khuyến mãi\n\nHoặc bạn có thể chọn một trong các câu hỏi phổ biến bên dưới, hoặc gõ "nhân viên" để kết nối với nhân viên hỗ trợ!'
    );
}

// Tạo tin nhắn người dùng
export function createUserMessage(content) {
    return new ChatMessage(Date.now(), 'user', content, dayjs(), <UserOutlined />);
}

// Tạo tin nhắn bot
export function createBotMessage(content) {
    return new ChatMessage(Date.now() + 1, 'bot', content, dayjs(), <RobotOutlined />);
}

// Tạo tin nhắn hệ thống
export function createSystemMessage(content) {
    return new ChatMessage(Date.now(), 'system', content, dayjs());
}

// Tạo tin nhắn nhân viên
export function createhostMessage(content) {
    return new ChatMessage(Date.now() + 1, 'host', content, dayjs(), <CustomerServiceOutlined />);
}
