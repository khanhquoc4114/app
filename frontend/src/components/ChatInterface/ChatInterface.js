import React, { useState, useEffect, useRef } from 'react';
import {
    Input,
    Button,
    Typography,
    Space,
    Avatar,
    Spin,
    Badge,
    Card
} from 'antd';
import {
    SendOutlined,
    RobotOutlined,
    UserOutlined,
    CustomerServiceOutlined,
    PaperClipOutlined,
    SmileOutlined,
    SearchOutlined,
    MoreOutlined,
    PhoneOutlined,
    VideoCameraOutlined,
    InfoCircleOutlined,
    ArrowLeftOutlined,
    MessageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const MessengerChatInterface = ({ onClose }) => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const messagesEndRef = useRef(null);

    // Check if mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Sample chat conversations
    const [chatList, setChatList] = useState([
        {
            id: 'ai-support',
            type: 'bot',
            name: 'AI Assistant',
            avatar: <RobotOutlined />,
            lastMessage: 'Tôi có thể giúp bạn đặt sân thể thao!',
            lastTime: dayjs().subtract(5, 'minute'),
            unreadCount: 0,
            online: true,
            avatarColor: '#1890ff'
        },
        {
            id: 'admin-support',
            type: 'admin',
            name: 'Nhân viên hỗ trợ',
            avatar: <CustomerServiceOutlined />,
            lastMessage: 'Chúng tôi sẽ hỗ trợ bạn 24/7',
            lastTime: dayjs().subtract(30, 'minute'),
            unreadCount: 2,
            online: true,
            avatarColor: '#52c41a'
        },
        {
            id: 'user-001',
            type: 'user',
            name: 'Nguyễn Văn Minh',
            avatar: 'M',
            lastMessage: 'Bạn có muốn đi chơi cầu lông không?',
            lastTime: dayjs().subtract(1, 'hour'),
            unreadCount: 1,
            online: true,
            avatarColor: '#722ed1'
        },
        {
            id: 'user-002',
            type: 'user',
            name: 'Trần Thị Lan',
            avatar: 'L',
            lastMessage: 'Sân tennis lúc 7h tối nhé!',
            lastTime: dayjs().subtract(2, 'hour'),
            unreadCount: 0,
            online: false,
            avatarColor: '#eb2f96'
        },
        {
            id: 'group-001',
            type: 'group',
            name: 'Nhóm Cầu Lông HCM',
            avatar: '🏸',
            lastMessage: 'Ai đi đánh cầu lông chiều nay không?',
            lastTime: dayjs().subtract(3, 'hour'),
            unreadCount: 5,
            online: true,
            avatarColor: '#fa541c',
            memberCount: 12
        },
        {
            id: 'user-003',
            type: 'user',
            name: 'Lê Hoàng Nam',
            avatar: 'N',
            lastMessage: 'Cảm ơn bạn đã book sân!',
            lastTime: dayjs().subtract(1, 'day'),
            unreadCount: 0,
            online: false,
            avatarColor: '#13c2c2'
        }
    ]);

    // Sample messages for different chats
    const sampleMessages = {
        'ai-support': [
            {
                id: 1,
                type: 'bot',
                content: 'Xin chào! Tôi là AI Assistant của hệ thống đặt sân thể thao. Tôi có thể giúp bạn:\n\n• Tìm hiểu về các sân thể thao\n• Hướng dẫn đặt sân\n• Giải đáp thắc mắc\n• Kết nối với nhân viên hỗ trợ\n\nBạn cần hỗ trợ gì?',
                timestamp: dayjs().subtract(10, 'minute'),
                avatar: <RobotOutlined />
            }
        ],
        'user-001': [
            {
                id: 1,
                type: 'user',
                content: 'Chào bạn! Mình thấy bạn hay đặt sân cầu lông nhỉ?',
                timestamp: dayjs().subtract(2, 'hour'),
                avatar: 'M',
                sender: 'Nguyễn Văn Minh'
            },
            {
                id: 2,
                type: 'me',
                content: 'Chào bạn! Đúng rồi, mình rất thích chơi cầu lông',
                timestamp: dayjs().subtract(1.5, 'hour'),
                avatar: <UserOutlined />
            },
            {
                id: 3,
                type: 'user',
                content: 'Bạn có muốn đi chơi cầu lông không? Mình đang tìm partner',
                timestamp: dayjs().subtract(1, 'hour'),
                avatar: 'M',
                sender: 'Nguyễn Văn Minh'
            }
        ],
        'group-001': [
            {
                id: 1,
                type: 'user',
                content: 'Chào mọi người!',
                timestamp: dayjs().subtract(4, 'hour'),
                avatar: 'A',
                sender: 'Admin'
            },
            {
                id: 2,
                type: 'user',
                content: 'Hi all! 👋',
                timestamp: dayjs().subtract(3.5, 'hour'),
                avatar: 'M',
                sender: 'Minh'
            },
            {
                id: 3,
                type: 'user',
                content: 'Ai đi đánh cầu lông chiều nay không?',
                timestamp: dayjs().subtract(3, 'hour'),
                avatar: 'L',
                sender: 'Lan'
            }
        ]
    };

    // Initialize messages
    useEffect(() => {
        setMessages(sampleMessages);
    }, []);

    // Auto scroll to bottom when messages change
    useEffect(() => {
        if (selectedChat) {
            setTimeout(() => scrollToBottom(), 100);
        }
    }, [messages, selectedChat]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
        // Mark as read
        setChatList(prev => 
            prev.map(c => 
                c.id === chat.id ? { ...c, unreadCount: 0 } : c
            )
        );
    };

    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedChat) return;

        const userMessage = {
            id: Date.now(),
            type: 'me',
            content: inputMessage,
            timestamp: dayjs(),
            avatar: <UserOutlined />
        };

        // Add message to current chat
        setMessages(prev => ({
            ...prev,
            [selectedChat.id]: [...(prev[selectedChat.id] || []), userMessage]
        }));

        // Update last message in chat list
        setChatList(prev => 
            prev.map(chat => 
                chat.id === selectedChat.id 
                ? { ...chat, lastMessage: inputMessage, lastTime: dayjs() }
                : chat
            )
        );

        setInputMessage('');

        // Simulate response for bot/admin
        if (selectedChat.type === 'bot' || selectedChat.type === 'admin') {
            setIsTyping(true);
            setTimeout(() => {
                const botResponse = generateBotResponse(inputMessage);
                const botMessage = {
                    id: Date.now() + 1,
                    type: selectedChat.type,
                    content: botResponse,
                    timestamp: dayjs(),
                    avatar: selectedChat.avatar
                };
                
                setMessages(prev => ({
                    ...prev,
                    [selectedChat.id]: [...(prev[selectedChat.id] || []), botMessage]
                }));
                
                setChatList(prev => 
                    prev.map(chat => 
                        chat.id === selectedChat.id 
                        ? { ...chat, lastMessage: botResponse.substring(0, 50) + '...', lastTime: dayjs() }
                        : chat
                    )
                );
                
                setIsTyping(false);
            }, 1500);
        }
    };

    const generateBotResponse = (userInput) => {
        const input = userInput.toLowerCase();

        if (input.includes('giờ') || input.includes('mở cửa')) {
            return 'Hệ thống sân thể thao mở cửa:\n\n🕕 06:00 - 22:00 hàng ngày\n🏸 Sân cầu lông: 06:00 - 22:00\n⚽ Sân bóng đá: 05:00 - 23:00\n🎾 Sân tennis: 06:00 - 21:00';
        }

        if (input.includes('đặt sân')) {
            return 'Để đặt sân:\n1️⃣ Chọn sân → Chọn ngày giờ → Đặt sân\n2️⃣ Thanh toán online\n3️⃣ Nhận xác nhận\n\nĐặt trước ít nhất 2 tiếng nhé!';
        }

        return `Cảm ơn bạn đã nhắn tin! Tôi đã nhận được: "${userInput}"\n\nTôi có thể hỗ trợ bạn về:\n• Thông tin sân thể thao\n• Hướng dẫn đặt sân\n• Chính sách và quy định\n• Kết nối nhân viên hỗ trợ`;
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredChats = chatList.filter(chat =>
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderChatItem = (chat) => (
        <div
            key={chat.id}
            onClick={() => handleChatSelect(chat)}
            style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: selectedChat?.id === chat.id ? '#e6f7ff' : 'transparent',
                transition: 'all 0.2s',
                borderBottom: '1px solid #f0f0f0'
            }}
            onMouseEnter={(e) => {
                if (selectedChat?.id !== chat.id) {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                }
            }}
            onMouseLeave={(e) => {
                if (selectedChat?.id !== chat.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
            }}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Badge dot={chat.online} offset={[-2, 2]}>
                    <Avatar
                        style={{ 
                            backgroundColor: chat.avatarColor,
                            flexShrink: 0
                        }}
                        size={48}
                    >
                        {typeof chat.avatar === 'string' ? chat.avatar : chat.avatar}
                    </Avatar>
                </Badge>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <Text strong style={{ fontSize: '14px' }}>
                            {chat.name}
                            {chat.type === 'group' && (
                                <Text type="secondary" style={{ fontSize: '12px', marginLeft: 4 }}>
                                    ({chat.memberCount})
                                </Text>
                            )}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                            {chat.lastTime.fromNow()}
                        </Text>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text 
                            type="secondary" 
                            style={{ 
                                fontSize: '13px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                flex: 1,
                                fontWeight: chat.unreadCount > 0 ? 'bold' : 'normal'
                            }}
                        >
                            {chat.lastMessage}
                        </Text>
                        {chat.unreadCount > 0 && (
                            <Badge count={chat.unreadCount} size="small" style={{ marginLeft: 8 }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMessage = (message) => {
        const isMe = message.type === 'me';
        const isBot = message.type === 'bot';
        const isAdmin = message.type === 'admin';

        return (
            <div
                key={message.id}
                style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: 16,
                    padding: isMe ? '0 20px 0 60px' : '0 60px 0 20px',
                    alignItems: 'flex-end'
                }}
            >
                {!isMe && (
                    <Avatar
                        style={{
                            backgroundColor: isBot ? '#1890ff' : isAdmin ? '#52c41a' : '#87d068',
                            marginRight: 8,
                            flexShrink: 0
                        }}
                        size={32}
                    >
                        {typeof message.avatar === 'string' ? message.avatar : message.avatar}
                    </Avatar>
                )}

                <div style={{ maxWidth: '70%' }}>
                    {!isMe && selectedChat?.type === 'group' && (
                        <Text style={{ 
                            fontSize: '12px', 
                            color: '#666', 
                            marginBottom: 4, 
                            display: 'block',
                            marginLeft: '12px',
                            fontWeight: 'bold'
                        }}>
                            {message.sender}
                        </Text>
                    )}
                    <div
                        style={{
                            padding: '10px 14px',
                            borderRadius: isMe ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                            backgroundColor: isMe ? '#1890ff' : '#f0f0f0',
                            color: isMe ? 'white' : 'black',
                            wordBreak: 'break-word',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5', fontSize: '14px' }}>
                            {message.content}
                        </div>
                    </div>
                    <div
                        style={{
                            fontSize: '11px',
                            color: '#999',
                            marginTop: 6,
                            marginLeft: isMe ? 0 : '12px',
                            textAlign: isMe ? 'right' : 'left'
                        }}
                    >
                        {message.timestamp.format('HH:mm')}
                    </div>
                </div>

                {isMe && (
                    <Avatar
                        icon={<UserOutlined />}
                        style={{ 
                            backgroundColor: '#87d068', 
                            marginLeft: 8, 
                            flexShrink: 0 
                        }}
                        size={32}
                    />
                )}
            </div>
        );
    };

    // Mobile: Show chat list or selected chat
    if (isMobile) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
                {!selectedChat ? (
                    // Mobile Chat List View
                    <>
                        {/* Header */}
                        <div style={{
                            padding: '16px',
                            background: '#fff',
                            borderBottom: '1px solid #e8e8e8',
                            flexShrink: 0
                        }}>
                            <Text strong style={{ fontSize: '24px', display: 'block', marginBottom: 16 }}>
                                Đoạn chat
                            </Text>
                            <Input
                                placeholder="Tìm kiếm trên Messenger"
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ borderRadius: '20px' }}
                            />
                        </div>
                        
                        {/* Chat List */}
                        <div style={{ 
                            flex: 1, 
                            overflowY: 'auto',
                            background: '#fff'
                        }}>
                            {filteredChats.map(renderChatItem)}
                        </div>
                    </>
                ) : (
                    // Mobile Chat View
                    <>
                        {/* Chat Header */}
                        <div style={{
                            padding: '12px 16px',
                            background: '#fff',
                            borderBottom: '1px solid #e8e8e8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <Button
                                    type="text"
                                    icon={<ArrowLeftOutlined />}
                                    onClick={() => setSelectedChat(null)}
                                    size="large"
                                />
                                
                                <Badge dot={selectedChat.online} offset={[-2, 2]}>
                                    <Avatar
                                        style={{ backgroundColor: selectedChat.avatarColor }}
                                        size={40}
                                    >
                                        {selectedChat.avatar}
                                    </Avatar>
                                </Badge>
                                <div>
                                    <Text strong style={{ fontSize: '16px' }}>{selectedChat.name}</Text>
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                        {selectedChat.online ? 'Đang hoạt động' : `Hoạt động ${selectedChat.lastTime.fromNow()}`}
                                    </div>
                                </div>
                            </div>
                            
                            <Space>
                                {selectedChat.type === 'user' && (
                                    <>
                                        <Button type="text" icon={<PhoneOutlined />} size="large" />
                                        <Button type="text" icon={<VideoCameraOutlined />} size="large" />
                                    </>
                                )}
                                <Button type="text" icon={<InfoCircleOutlined />} size="large" />
                            </Space>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px 0',
                            background: '#fafafa'
                        }}>
                            {(messages[selectedChat.id] || []).map(renderMessage)}

                            {isTyping && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    marginBottom: 16,
                                    padding: '0 20px'
                                }}>
                                    <Avatar
                                        style={{ backgroundColor: selectedChat.avatarColor, marginRight: 8, flexShrink: 0 }}
                                        size={32}
                                    >
                                        {selectedChat.avatar}
                                    </Avatar>
                                    <div style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#f0f0f0',
                                        borderRadius: '18px 18px 18px 6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}>
                                        <Spin size="small" style={{ marginRight: 8 }} />
                                        <Text style={{ fontSize: '13px', color: '#666' }}>Đang nhập...</Text>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div style={{
                            padding: '12px 16px',
                            background: '#fff',
                            borderTop: '1px solid #e8e8e8',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                                <Button
                                    type="text"
                                    icon={<PaperClipOutlined />}
                                    size="large"
                                />
                                
                                <div style={{ flex: 1 }}>
                                    <TextArea
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Aa"
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                        style={{
                                            borderRadius: '20px',
                                            resize: 'none',
                                            fontSize: '16px'
                                        }}
                                    />
                                </div>

                                <Button
                                    type="text"
                                    icon={<SmileOutlined />}
                                    size="large"
                                />
                                
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim()}
                                    size="large"
                                    style={{ borderRadius: '50%' }}
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Desktop view
return (
    <div style={{
        height: '100%',
        display: 'flex',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden'
    }}>
        {/* Desktop Sidebar */}
        <div style={{
            width: '320px',
            borderRight: '1px solid #e8e8e8',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            {/* Header - Fixed - Đã bỏ vì Drawer có title riêng */}
            <div style={{
                padding: '16px 16px 8px 16px',
                background: '#fff',
                borderBottom: '1px solid #e8e8e8',
                flexShrink: 0
            }}>
                <Input
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: '20px' }}
                    size="small"
                />
            </div>

            {/* Chat List - Scrollable */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                background: '#fafafa',
                minHeight: 0
            }}>
                {filteredChats.map(renderChatItem)}
            </div>
        </div>

        {/* Chat Content */}
        {selectedChat ? (
            <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                overflow: 'hidden',
                position: 'relative'
            }}>
                {/* Chat Header - Simplified vì đã có header của Drawer */}
                <div style={{
                    padding: '12px 16px',
                    background: '#fff',
                    borderBottom: '1px solid #e8e8e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Badge dot={selectedChat.online} offset={[-2, 2]}>
                            <Avatar
                                style={{ backgroundColor: selectedChat.avatarColor }}
                                size={32}
                            >
                                {selectedChat.avatar}
                            </Avatar>
                        </Badge>
                        <div>
                            <Text strong style={{ fontSize: '14px' }}>{selectedChat.name}</Text>
                            <div style={{ fontSize: '11px', color: '#999' }}>
                                {selectedChat.online ? 'Đang hoạt động' : `Hoạt động ${selectedChat.lastTime.fromNow()}`}
                            </div>
                        </div>
                    </div>
                    
                    <Space size="small">
                        {selectedChat.type === 'user' && (
                            <>
                                <Button type="text" icon={<PhoneOutlined />} size="small" />
                                <Button type="text" icon={<VideoCameraOutlined />} size="small" />
                            </>
                        )}
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                    </Space>
                </div>

                {/* Messages - Scrollable */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    padding: '16px 0',
                    background: '#fafafa',
                    minHeight: 0
                }}>
                    {(messages[selectedChat.id] || []).map(renderMessage)}

                    {isTyping && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            marginBottom: 16,
                            padding: '0 20px'
                        }}>
                            <Avatar
                                style={{ backgroundColor: selectedChat.avatarColor, marginRight: 8, flexShrink: 0 }}
                                size={32}
                            >
                                {selectedChat.avatar}
                            </Avatar>
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '18px 18px 18px 6px',
                                display: 'flex',
                                alignItems: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                                <Spin size="small" style={{ marginRight: 8 }} />
                                <Text style={{ fontSize: '13px', color: '#666' }}>Đang nhập...</Text>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input - Fixed */}
                <div style={{
                    padding: '16px',
                    background: '#fff',
                    borderTop: '1px solid #e8e8e8',
                    flexShrink: 0,
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <Button
                            type="text"
                            icon={<PaperClipOutlined />}
                            size="large"
                            style={{ borderRadius: '50%' }}
                        />
                        
                        <div style={{ flex: 1 }}>
                            <TextArea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Aa"
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                style={{
                                    borderRadius: '20px',
                                    resize: 'none',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <Button
                            type="text"
                            icon={<SmileOutlined />}
                            size="large"
                            style={{ borderRadius: '50%' }}
                        />
                        
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim()}
                            size="large"
                            style={{ borderRadius: '50%' }}
                        />
                    </div>
                </div>
            </div>
        ) : (
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fafafa',
                padding: '20px'
            }}>
                <Card style={{ textAlign: 'center', maxWidth: 400 }}>
                    <Avatar size={64} icon={<MessageOutlined />} style={{ marginBottom: 16 }} />
                    <Text strong style={{ fontSize: '18px', display: 'block', marginBottom: 8 }}>
                        Chọn một cuộc trò chuyện
                    </Text>
                    <Text type="secondary">
                        Chọn từ danh sách bên trái để bắt đầu trò chuyện
                    </Text>
                </Card>
            </div>
        )}
    </div>
);
};

export default MessengerChatInterface;