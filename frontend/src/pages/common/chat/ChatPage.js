// Trang chat hỗ trợ khách hàng
import React, { useState, useEffect, useRef } from 'react';
import { Card, Input, Button, Typography, Space, Avatar, Divider, Tag, Spin } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CustomerServiceOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
    quickQuestions,
    getWelcomeMessage,
    generateBotResponse,
    createUserMessage,
    createBotMessage,
    createSystemMessage,
    createhostMessage
} from './chatLogic';

const { Title, Text } = Typography;

const ChatPage = () => {
    // State quản lý tin nhắn, input, trạng thái chat
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatMode, setChatMode] = useState('bot'); // 'bot' hoặc 'human'
    const messagesEndRef = useRef(null);

    // Tin nhắn chào mừng bot
    useEffect(() => {
        setMessages([getWelcomeMessage()]);
    }, []);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Gửi tin nhắn người dùng và phản hồi bot
    const handleSendMessage = () => {
        if (!inputMessage.trim()) return;
        setMessages(prev => [...prev, createUserMessage(inputMessage)]);
        setInputMessage('');
        setIsTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, createBotMessage(generateBotResponse(inputMessage))]);
            setIsTyping(false);
        }, 1500);
    };


    // Xử lý chọn câu hỏi nhanh
    const handleQuickQuestion = (question) => {
        setInputMessage(question);
        setTimeout(() => handleSendMessage(), 100);
    };

    // Kết nối với nhân viên hỗ trợ
    const connectToHuman = () => {
        setChatMode('human');
        setMessages(prev => [...prev, createSystemMessage('Đang kết nối với nhân viên hỗ trợ... Vui lòng chờ trong giây lát.')]);
        setTimeout(() => {
            setMessages(prev => [...prev, createhostMessage('Xin chào! Tôi là Minh - nhân viên hỗ trợ khách hàng. Tôi có thể giúp gì cho bạn?')]);
        }, 2000);
    };

    // Hiển thị một tin nhắn chat
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
                            backgroundColor: message.type === 'host' ? '#52c41a' : '#1890ff',
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
                    <div style={{ whiteSpace: 'pre-line' }}>{message.content}</div>
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