import React, { useState, useEffect } from 'react';
import { Button, Badge, Drawer, Typography, Space, Avatar } from 'antd';
import {
    MessageOutlined,
    CloseOutlined,
    CustomerServiceOutlined,
    RobotOutlined
} from '@ant-design/icons';
import ChatInterface from '../ChatInterface/ChatInterface';

const { Text } = Typography;

const ChatBubble = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Simulate new message notification
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isOpen) {
                setHasNewMessage(true);
            }
        }, 10000); // Show notification after 10 seconds

        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setHasNewMessage(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    // Hide on mobile when keyboard is open (optional)
    useEffect(() => {
        const handleResize = () => {
            if (window.innerHeight < 500) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Chat Bubble */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 8
                }}
            >
                {/* Welcome message (show when has new message) */}
                {hasNewMessage && !isOpen && (
                    <div
                        style={{
                            background: '#fff',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            maxWidth: 250,
                            position: 'relative',
                            animation: 'slideInUp 0.3s ease'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            <Avatar
                                size="small"
                                icon={<RobotOutlined />}
                                style={{ backgroundColor: '#1890ff', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1 }}>
                                <Text style={{ fontSize: '13px', lineHeight: '1.4' }}>
                                    Xin chào! Tôi có thể giúp gì cho bạn? 👋
                                </Text>
                            </div>
                            <Button
                                type="text"
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={() => setHasNewMessage(false)}
                                style={{
                                    padding: 0,
                                    width: 16,
                                    height: 16,
                                    minWidth: 16,
                                    fontSize: '10px',
                                    flexShrink: 0
                                }}
                            />
                        </div>
                        {/* Arrow pointing to bubble */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: -6,
                                right: 20,
                                width: 0,
                                height: 0,
                                borderLeft: '6px solid transparent',
                                borderRight: '6px solid transparent',
                                borderTop: '6px solid #fff'
                            }}
                        />
                    </div>
                )}

                {/* Main Chat Button */}
                <Badge dot={hasNewMessage && !isOpen} offset={[-8, 8]}>
                    <Button
                        type="primary"
                        shape="circle"
                        size="large"
                        icon={<MessageOutlined />}
                        onClick={handleToggle}
                        style={{
                            width: 56,
                            height: 56,
                            fontSize: '20px',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.4)',
                            border: 'none',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                    />
                </Badge>
            </div>

            {/* Chat Drawer */}
            <Drawer
                title={
                    <Space>
                        <CustomerServiceOutlined />
                        <span>Hỗ trợ khách hàng</span>
                        <Badge status="success" text="Trực tuyến" />
                    </Space>
                }
                placement="right"
                onClose={handleClose}
                open={isOpen}
                width={400}
                styles={{
                    body: { padding: 0 }
                }}
                extra={
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={handleClose}
                    />
                }
            >
                <ChatInterface onClose={handleClose} />
            </Drawer>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% {
                        transform: translateY(0);
                    }
                    40% {
                        transform: translateY(-10px);
                    }
                    60% {
                        transform: translateY(-5px);
                    }
                }

                .chat-bubble-bounce {
                    animation: bounce 2s infinite;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .chat-bubble-container {
                        bottom: 80px !important; /* Above mobile navigation if any */
                        right: 16px !important;
                    }
                }
            `}</style>
        </>
    );
};

export default ChatBubble;