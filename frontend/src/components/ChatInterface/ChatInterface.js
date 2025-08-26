import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Input,
    Button,
    Typography,
    Space,
    Avatar,
    Spin,
    Badge,
    Card,
    message as antMessage
} from 'antd';
import {
    SendOutlined,
    UserOutlined,
    SearchOutlined,
    MoreOutlined,
    PhoneOutlined,
    VideoCameraOutlined,
    InfoCircleOutlined,
    ArrowLeftOutlined,
    MessageOutlined,
    CheckOutlined,
    ReloadOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

const ChatInterface = ({ defaultChatUser, onClose }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [token] = useState(localStorage.getItem('token'));
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState({});
    const [inputMessage, setInputMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [unreadCounts, setUnreadCounts] = useState({});
    
    const websocketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);


    // API Base URL
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const WS_BASE = API_BASE.replace('http', 'ws');
    const currentUserRef = useRef(null);

    useEffect(() => {
    currentUserRef.current = currentUser;
    }, [currentUser]);

    // useEffect(() => {
    //     if (defaultChatUser && !selectedChat && users.length > 0) {
    //         const targetUser = users.find((user) => user.id === defaultChatUser);
    //         if (targetUser) {
    //             handleChatSelect(targetUser);
    //         }
    //     }
    // }, [defaultChatUser, users, selectedChat]);

    // Check if mobile

useEffect(() => {
    if (defaultChatUser && !selectedChat) {
        let targetUser = users.find(user => user.id === defaultChatUser);
        if (!targetUser) {
            // Nếu không tìm thấy trong danh sách đã chat, fetch thông tin user từ API
            fetch(`${API_BASE}/api/users/${defaultChatUser}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('User not found');
            })
            .then(userData => {
                targetUser = userData;
                // Khi đã có targetUser, mở chat với họ
                handleChatSelect(targetUser);
                // Đồng thời, cập nhật danh sách users nếu cần
                setUsers(prev => [...prev, targetUser]);
            })
            .catch(error => {
                console.error('Failed to fetch user detail:', error);
            });
        } else {
            handleChatSelect(targetUser);
        }
    }
}, [defaultChatUser, users, selectedChat]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Fetch current user
    const fetchCurrentUser = async () => {
        if (!token) return;
        
        try {
            const response = await fetch(`${API_BASE}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const user = await response.json();
                setCurrentUser(user);
                await fetchUsers();
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    useEffect(() => {
    if (token) {
        fetchCurrentUser();
    }
    }, [token]);

    // Chỉ connect khi currentUser đã có
    useEffect(() => {
    if (token && currentUser && !websocketRef.current) {
        connectWebSocket();
    }
    return () => {
        if (websocketRef.current) websocketRef.current.close();
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
    }, [token, currentUser]);

    // Fetch users list và preload recent conversations
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE}/api/users/all-chatted`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const allUsers = await response.json();
                const filteredUsers = allUsers.filter(user => user.id !== currentUser?.id);
                setUsers(filteredUsers);
                
                // Load recent conversations
                await Promise.all(
                    filteredUsers.map(async (user) => {
                        try {
                            const historyResponse = await fetch(`${API_BASE}/api/messages/history/${user.id}?limit=1`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            
                            if (historyResponse.ok) {
                                const history = await historyResponse.json();
                                if (history.length > 0) {
                                    setMessages(prev => ({
                                        ...prev,
                                        [user.id]: history
                                    }));
                                }
                            } else {
                                setMessages(prev => ({
                                    ...prev,
                                    [user.id]: []
                                }));
                            }
                        } catch (error) {
                            console.error(`Failed to fetch history for user ${user.id}:`, error);
                        }
                    })
                );
            }
        } catch (error) {
            antMessage.error('Không thể tải danh sách người dùng đã nói chuyện');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (websocketRef.current) {
            interval = setInterval(() => {
                if (websocketRef.current?.readyState === WebSocket.OPEN) {
                    websocketRef.current.send(JSON.stringify({ type: "ping" }));
                }
            }, 30000); // 30s
        }
        return () => clearInterval(interval);
    }, [websocketRef.current]);

    // WebSocket connection
    let retries = 0;
    const connectWebSocket = useCallback(() => {
        if (!token || websocketRef.current) return;

        try {
            setConnecting(true);
            const wsUrl = `${WS_BASE}/chat?token=${encodeURIComponent(token)}`;
            const ws = new WebSocket(wsUrl);
            
            ws.onopen = () => {
                console.log('WebSocket connected');
                setConnecting(false);
                websocketRef.current = ws;
                
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

        ws.onclose = (event) => {
            websocketRef.current = null;
            setConnecting(false);

            if (event.code !== 1000 && token) {
                const timeout = Math.min(10000, 1000 * 2 ** retries); // max 10s
                reconnectTimeoutRef.current = setTimeout(() => {
                    retries++;
                    connectWebSocket();
                }, timeout);
            } else {
                retries = 0; // reset khi thành công
            }
        };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnecting(false);
            };
            
        } catch (error) {
            console.error('Failed to connect WebSocket:', error);
            setConnecting(false);
        }
    }, [token, WS_BASE]);
    
    const handleWebSocketMessage = (data) => {
        const user = currentUserRef.current;
        if (!user) {
            console.warn("Bỏ qua message vì currentUser chưa set:", data);
            return;
        }

        const { id, from, message: content, created_at, to } = data;
        let targetUserId, newMessage;

        if (from === user.id) {
            // Tin nhắn mình gửi
            targetUserId = to;
            newMessage = {
                id,
                sender_id: user.id,
                receiver_id: to,
                content,
                created_at,
                is_read: false
            };

            setMessages(prev => {
            const userMessages = prev[targetUserId] || [];
            const filtered = userMessages.filter(msg => !(msg.sending && msg.content === content));
            if (filtered.some(msg => msg.id === id)) return prev;
            return { ...prev, [targetUserId]: [...filtered, newMessage] };
            });
        } else {
            // Tin nhắn nhận
            targetUserId = from;
            newMessage = {
                id,
                sender_id: from,
                receiver_id: user.id,
                content,
                created_at,
                is_read: selectedChat?.id === from
            };

            setMessages(prev => {
            const userMessages = prev[from] || [];
            if (userMessages.some(msg => msg.id === id)) return prev;
            return { ...prev, [from]: [...userMessages, newMessage] };
            });

            if (selectedChat?.id !== from) {
            setUnreadCounts(prev => ({ ...prev, [from]: (prev[from] || 0) + 1 }));
            } else {
            setTimeout(() => markAsRead(from), 500);
            }
        }

        // Update sidebar
        setUsers(prev => {
            let existingUser = prev.find(u => u.id === targetUserId);
            if (!existingUser) {
                // Nếu chưa có, bạn có thể tạo thông tin tạm (nên fetch chi tiết nếu cần)
                existingUser = { id: targetUserId, name: "User " + targetUserId };
            }
            return [existingUser, ...prev.filter(u => u.id !== targetUserId)];
        });
    };

    const sendMessage = useCallback((receiverId, content) => {
        if (!websocketRef.current || !content.trim()) return;

        const messageData = {
            receiver_id: receiverId,
            content: content.trim()
        };

        // Thêm message vào UI ngay lập tức
        const tempMessage = {
            id: `temp_${Date.now()}`,
            sender_id: currentUser.id,
            receiver_id: receiverId,
            content: content.trim(),
            created_at: new Date().toISOString(),
            is_read: false,
            sending: true
        };

        setMessages(prev => ({
            ...prev,
            [receiverId]: [...(prev[receiverId] || []), tempMessage]
        }));

        // Gửi qua WebSocket
        websocketRef.current.send(JSON.stringify(messageData));
    }, [currentUser]);

    // Fetch chat history
    const fetchChatHistory = async (userId) => {
        try {
            const response = await fetch(`${API_BASE}/api/messages/history/${userId}?limit=50`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const history = await response.json();
                setMessages(prev => ({
                    ...prev,
                    [userId]: history.length ? history : []
                }));
            }
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        }
    };

    // Mark messages as read
    const markAsRead = async (userId) => {
        try {
            await fetch(`${API_BASE}/api/messages/mark-read/${userId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setUnreadCounts(prev => ({
                ...prev,
                [userId]: 0
            }));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Handle chat selection
    const handleChatSelect = async (user) => {
        setSelectedChat(user);
        await fetchChatHistory(user.id);
        await markAsRead(user.id);
    };

    // Handle send message
    const handleSendMessage = () => {
        if (!inputMessage.trim() || !selectedChat) return;

        sendMessage(selectedChat.id, inputMessage);
        setInputMessage('');
        fetchChatHistory(selectedChat.id);
        setUsers(prev => [selectedChat, ...prev.filter(u => u.id !== selectedChat.id)]);
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Get user by ID
    const getUserById = (id) => {
        return users.find(user => user.id === id);
    };

    // Auto scroll to bottom ngay lập tức
    useEffect(() => {
        if (selectedChat) {
            scrollToBottom();
        }
    }, [messages, selectedChat]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };


    // Render message
    const renderMessage = (message) => {
        const isMe = message.sender_id === currentUser?.id;
        const sender = isMe ? currentUser : getUserById(message.sender_id);

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
                            backgroundColor: '#87d068',
                            marginRight: 8,
                            flexShrink: 0
                        }}
                        size={32}
                    >
                        {sender?.name?.[0] || <UserOutlined />}
                    </Avatar>
                )}

                <div style={{ maxWidth: '70%' }}>
                    <div
                        style={{
                            padding: '10px 14px',
                            borderRadius: isMe ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                            backgroundColor: isMe ? '#1890ff' : '#f0f0f0',
                            color: isMe ? 'white' : 'black',
                            wordBreak: 'break-word',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            position: 'relative'
                        }}
                    >
                        <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5', fontSize: '14px' }}>
                            {message.content}
                        </div>
                        {message.sending && (
                            <Spin size="small" style={{ 
                                position: 'absolute', 
                                right: -24, 
                                top: '50%', 
                                transform: 'translateY(-50%)' 
                            }} />
                        )}
                    </div>
                    
                    <div style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: 6,
                        marginLeft: isMe ? 0 : '12px',
                        textAlign: isMe ? 'right' : 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        gap: 4
                    }}>
                        {new Date(message.created_at).toLocaleTimeString('vi-VN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                        {isMe && message.is_read && <CheckOutlined style={{ color: '#1890ff' }} />}
                    </div>
                </div>

                {isMe && (
                    <Avatar
                        style={{ 
                            backgroundColor: '#1890ff', 
                            marginLeft: 8, 
                            flexShrink: 0 
                        }}
                        size={32}
                    >
                        {currentUser?.name?.[0] || <UserOutlined />}
                    </Avatar>
                )}
            </div>
        );
    };

    // Render user item
    const renderUserItem = (user) => {
        const userMessages = messages[user.id] || [];
        const lastMessage = userMessages[userMessages.length - 1];
        const unreadCount = unreadCounts[user.id] || 0;

        return (
            <div
                key={user.id}
                onClick={() => handleChatSelect(user)}
                style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: selectedChat?.id === user.id ? '#e6f7ff' : 'transparent',
                    transition: 'all 0.2s',
                    borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={(e) => {
                    if (selectedChat?.id !== user.id) {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                    }
                }}
                onMouseLeave={(e) => {
                    if (selectedChat?.id !== user.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <Badge dot={onlineUsers.has(user.id)} offset={[-2, 2]}>
                        <Avatar
                            style={{ 
                                backgroundColor: '#87d068',
                                flexShrink: 0
                            }}
                            size={48}
                        >
                            {user.name?.[0] || user.username?.[0] || <UserOutlined />}
                        </Avatar>
                    </Badge>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <Text strong style={{ fontSize: '14px' }}>
                                {user.name || user.username}
                            </Text>
                            {lastMessage && (
                                <Text type="secondary" style={{ fontSize: '11px' }}>
                                    {new Date(lastMessage.created_at).toLocaleTimeString('vi-VN', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </Text>
                            )}
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
                                    fontWeight: unreadCount > 0 ? 'bold' : 'normal'
                                }}
                            >
                                {lastMessage?.content || 'Bắt đầu cuộc trò chuyện'}
                            </Text>
                            {unreadCount > 0 && (
                                <Badge count={unreadCount} size="small" style={{ marginLeft: 8 }} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!currentUser && token) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    // Mobile view
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
                    <>
                        <div style={{
                            padding: '16px',
                            background: '#fff',
                            borderBottom: '1px solid #e8e8e8',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Text strong style={{ fontSize: '24px' }}>
                                    Đoạn chat
                                </Text>
                                <Space>
                                    {connecting && <Spin size="small" />}
                                    <Button 
                                        type="text" 
                                        icon={<ReloadOutlined />} 
                                        onClick={() => fetchUsers()}
                                        loading={loading}
                                    />
                                </Space>
                            </div>
                            <Input
                                placeholder="Tìm kiếm trên Messenger"
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ borderRadius: '20px' }}
                            />
                        </div>
                        
                        <div style={{ 
                            flex: 1, 
                            overflowY: 'auto',
                            background: '#fff'
                        }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <Spin size="large" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <Text type="secondary">Không tìm thấy người dùng</Text>
                                </div>
                            ) : (
                                filteredUsers.map(renderUserItem)
                            )}
                        </div>
                    </>
                ) : (
                    <>
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
                                
                                <Badge dot={onlineUsers.has(selectedChat.id)} offset={[-2, 2]}>
                                    <Avatar
                                        style={{ backgroundColor: '#87d068' }}
                                        size={40}
                                    >
                                        {selectedChat.name?.[0] || selectedChat.username?.[0] || <UserOutlined />}
                                    </Avatar>
                                </Badge>
                                <div>
                                    <Text strong style={{ fontSize: '16px' }}>
                                        {selectedChat.name || selectedChat.username}
                                    </Text>
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                        {onlineUsers.has(selectedChat.id) ? 'Đang hoạt động' : 'Offline'}
                                    </div>
                                </div>
                            </div>
                            
                            <Space>
                                <Button type="text" icon={<PhoneOutlined />} size="large" />
                                <Button type="text" icon={<VideoCameraOutlined />} size="large" />
                                <Button type="text" icon={<InfoCircleOutlined />} size="large" />
                            </Space>
                        </div>

                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px 0',
                            background: '#fafafa'
                        }}>
                            {(messages[selectedChat.id] || []).map(renderMessage)}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{
                            padding: '12px 16px',
                            background: '#fff',
                            borderTop: '1px solid #e8e8e8',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
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
                                    type="primary"
                                    icon={<SendOutlined />}
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || !websocketRef.current}
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
            {/* Sidebar */}
            <div style={{
                width: '320px',
                borderRight: '1px solid #e8e8e8',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
            }}>
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

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    background: '#fafafa',
                    minHeight: 0
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Text type="secondary">Không tìm thấy người dùng</Text>
                        </div>
                    ) : (
                        filteredUsers.map(renderUserItem)
                    )}
                </div>
            </div>

            {/* Chat Content */}
            {selectedChat ? (
                <div style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    overflow: 'hidden'
                }}>
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
                            <Badge dot={onlineUsers.has(selectedChat.id)} offset={[-2, 2]}>
                                <Avatar
                                    style={{ backgroundColor: '#87d068' }}
                                    size={32}
                                >
                                    {selectedChat.name?.[0] || selectedChat.username?.[0] || <UserOutlined />}
                                </Avatar>
                            </Badge>
                            <div>
                                <Text strong style={{ fontSize: '14px' }}>
                                    {selectedChat.name || selectedChat.username}
                                </Text>
                                <div style={{ fontSize: '11px', color: '#999' }}>
                                    {onlineUsers.has(selectedChat.id) ? 'Đang hoạt động' : 'Offline'}
                                </div>
                            </div>
                        </div>
                        
                        <Space size="small">
                            <Button type="text" icon={<PhoneOutlined />} size="small" />
                            <Button type="text" icon={<VideoCameraOutlined />} size="small" />
                            <Button type="text" icon={<MoreOutlined />} size="small" />
                        </Space>
                    </div>

                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '16px 0',
                        background: '#fafafa',
                        minHeight: 0
                    }}>
                        {(messages[selectedChat.id] || []).map(renderMessage)}
                        <div ref={messagesEndRef} />
                    </div>

                    <div style={{
                        padding: '16px',
                        background: '#fff',
                        borderTop: '1px solid #e8e8e8',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
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
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || !websocketRef.current}
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
                        {!websocketRef.current && (
                            <div style={{ marginTop: 16 }}>
                                <Button 
                                    type="primary" 
                                    icon={<ReloadOutlined />}
                                    onClick={() => connectWebSocket()}
                                    loading={connecting}
                                >
                                    Kết nối lại
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;