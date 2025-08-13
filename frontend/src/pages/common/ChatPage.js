import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    Input,
    Button,
    Typography,
    Space,
    Avatar,
    Divider,
    Tag,
    Empty,
    Spin
} from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    CustomerServiceOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatMode, setChatMode] = useState('bot'); // 'bot' or 'human'
    const messagesEndRef = useRef(null);

    // Quick questions
    const quickQuestions = [
        'Giờ mở cửa của sân?',
        'Cách đặt sân?',
        'Chính sách hủy đặt?',
        'Giá thuê sân?',
        'Liên hệ hỗ trợ'
    ];

    // Initial bot message
    useEffect(() => {
        const welcomeMessage = {
            id: 1,
            type: 'bot',
            content: 'Xin chào! Tôi là AI Assistant của hệ thống đặt sân thể thao. Tôi có thể giúp bạn:\n\n• Tìm hiểu về các sân thể thao\n• Hướng dẫn đặt sân\n• Giải đáp thắc mắc\n• Kết nối với nhân viên hỗ trợ\n\nBạn cần hỗ trợ gì?',
            timestamp: dayjs(),
            avatar: <RobotOutlined />
        };
        setMessages([welcomeMessage]);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: dayjs(),
            avatar: <UserOutlined />
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const botResponse = generateBotResponse(inputMessage);
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: botResponse,
                timestamp: dayjs(),
                avatar: <RobotOutlined />
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const generateBotResponse = (userInput) => {
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

        return 'Cảm ơn bạn đã liên hệ! Tôi hiểu bạn đang cần hỗ trợ về "' + userInput + '".\n\nTôi có thể giúp bạn về:\n• Thông tin sân thể thao\n• Hướng dẫn đặt sân\n• Chính sách và quy định\n• Giá cả và khuyến mãi\n\nHoặc bạn có thể chọn một trong các câu hỏi phổ biến bên dưới, hoặc gõ "nhân viên" để kết nối với nhân viên hỗ trợ!';
    };

    const handleQuickQuestion = (question) => {
        setInputMessage(question);
        setTimeout(() => handleSendMessage(), 100);
    };

    const connectToHuman = () => {
        setChatMode('human');
        const humanMessage = {
            id: Date.now(),
            type: 'system',
            content: 'Đang kết nối với nhân viên hỗ trợ... Vui lòng chờ trong giây lát.',
            timestamp: dayjs()
        };
        setMessages(prev => [...prev, humanMessage]);

        setTimeout(() => {
            const staffMessage = {
                id: Date.now() + 1,
                type: 'staff',
                content: 'Xin chào! Tôi là Minh - nhân viên hỗ trợ khách hàng. Tôi có thể giúp gì cho bạn?',
                timestamp: dayjs(),
                avatar: <CustomerServiceOutlined />
            };
            setMessages(prev => [...prev, staffMessage]);
        }, 2000);
    };

    const renderMessage = (message) => {
        const isUser = message.type === 'user';
        const isSystem = message.type === 'system';

        return (
            <div
                key={message.id}
                style={{
                    display: 'flex',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                    marginBottom: 16
                }}
            >
                {!isUser && !isSystem && (
                    <Avatar
                        icon={message.avatar}
                        style={{
                            backgroundColor: message.type === 'staff' ? '#52c41a' : '#1890ff',
                            marginRight: 8
                        }}
                    />
                )}

                <div
                    style={{
                        maxWidth: '70%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: isUser ? '#1890ff' : isSystem ? '#f0f0f0' : '#f6f6f6',
                        color: isUser ? 'white' : 'black'
                    }}
                >
                    <div style={{ whiteSpace: 'pre-line' }}>
                        {message.content}
                    </div>
                    <div
                        style={{
                            fontSize: '11px',
                            opacity: 0.7,
                            marginTop: 4,
                            textAlign: isUser ? 'right' : 'left'
                        }}
                    >
                        {message.timestamp.format('HH:mm')}
                    </div>
                </div>

                {isUser && (
                    <Avatar
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#87d068', marginLeft: 8 }}
                    />
                )}
            </div>
        );
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Hỗ trợ khách hàng</Title>
                <Space>
                    <Tag color={chatMode === 'bot' ? 'blue' : 'default'}>
                        🤖 AI Assistant
                    </Tag>
                    <Tag color={chatMode === 'human' ? 'green' : 'default'}>
                        👨‍💼 Nhân viên hỗ trợ
                    </Tag>
                </Space>
            </div>

            <Card style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                {/* Chat messages */}
                <div
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px 0',
                        marginBottom: 16
                    }}
                >
                    {messages.map(renderMessage)}

                    {isTyping && (
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff', marginRight: 8 }} />
                            <div style={{ padding: '8px 12px', backgroundColor: '#f6f6f6', borderRadius: '12px' }}>
                                <Spin size="small" /> Đang trả lời...
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick questions */}
                {messages.length <= 1 && (
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ marginBottom: 8, display: 'block' }}>
                            <QuestionCircleOutlined /> Câu hỏi thường gặp:
                        </Text>
                        <Space wrap>
                            {quickQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    size="small"
                                    onClick={() => handleQuickQuestion(question)}
                                >
                                    {question}
                                </Button>
                            ))}
                        </Space>
                        <Divider />
                    </div>
                )}

                {/* Input area */}
                <div style={{ display: 'flex', gap: 8 }}>
                    <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onPressEnter={handleSendMessage}
                        placeholder="Nhập tin nhắn..."
                        style={{ flex: 1 }}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim()}
                    >
                        Gửi
                    </Button>
                    {chatMode === 'bot' && (
                        <Button
                            icon={<CustomerServiceOutlined />}
                            onClick={connectToHuman}
                        >
                            Nhân viên
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ChatPage;