import React, { useState, useEffect } from 'react';
import {
    Dropdown,
    Badge,
    List,
    Avatar,
    Typography,
    Button,
    Empty,
    Divider
} from 'antd';
import {
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
    CalendarOutlined,
    DollarOutlined,
    UserOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getToken } from '../../utils/auth';
import { useNotifications } from "../../contexts/NotificationContext";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationDropdown = ({ children,
        onMarkAsRead
    }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [notificationList, setNotificationList] = useNotifications();
    
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = getToken();
            if (!token) return;

            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setNotificationList(data.map(n => ({
                    ...n,
                    timestamp: dayjs(n.timestamp)
                })));
                console.log("Notifications:", data);
            }
        };

        fetchNotifications();
    }, [setNotificationList]);

    const unreadCount = notificationList.filter(n => !n.read).length;
    const recentNotifications = notificationList.slice(0, 4); // Chỉ hiển thị 4 thông báo gần nhất

    const getNotificationIcon = (type) => {
        const icons = {
            booking_confirmed: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            booking_cancelled: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
            payment_success: <DollarOutlined style={{ color: '#52c41a' }} />,
            payment_failed: <WarningOutlined style={{ color: '#ff4d4f' }} />,
            booking_reminder: <CalendarOutlined style={{ color: '#1890ff' }} />,
            promotion: <InfoCircleOutlined style={{ color: '#faad14' }} />,
            system: <WarningOutlined style={{ color: '#722ed1' }} />,
            user: <UserOutlined style={{ color: '#1890ff' }} />
        };
        return icons[type] || <BellOutlined />;
    };

    const handleViewAll = () => {
        setVisible(false);
        navigate('/notifications');
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}/read`,
            { method: "PATCH" }
            );

            if (!res.ok) throw new Error("Failed to mark notification as read");

            setNotificationList((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
            );

            if (onMarkAsRead) {
            onMarkAsRead(notificationId);
            }
        } catch (err) {
            console.error("Lỗi khi mark as read:", err);
        }
    };

    const handleDelete = async (notificationId) => {
        const token = getToken();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            setNotificationList(prev => prev.filter(n => n.id !== notificationId));
        }
    };

    const dropdownContent = (
        <div style={{
            width: 380,
            maxHeight: 500,
            backgroundColor: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px 12px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <Text strong style={{ fontSize: '16px' }}>Thông báo</Text>
                    {unreadCount > 0 && (
                        <Badge
                            count={unreadCount}
                            size="small"
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </div>
                <Button
                    type="link"
                    size="small"
                    onClick={handleViewAll}
                    style={{ padding: 0 }}
                >
                    Xem tất cả
                </Button>
            </div>

            {/* Notifications List */}
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {recentNotifications.length > 0 ? (
                    <List
                        dataSource={recentNotifications}
                        renderItem={(notification) => (
                            <List.Item
                                style={{
                                    padding: '12px 20px',
                                    backgroundColor: notification.read ? '#fff' : '#f6ffed',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f5f5f5'
                                }}
                                onClick={() => {
                                    setVisible(false);
                                    // Handle notification click
                                }}
                                actions={[
                                    <Dropdown
                                        trigger={['click']}
                                        menu={{
                                            items: [
                                                !notification.read && {
                                                    key: 'read',
                                                    icon: <CheckOutlined />,
                                                    label: 'Đánh dấu đã đọc',
                                                    onClick: (e) => handleMarkAsRead(notification.id, e)
                                                },
                                                {
                                                    key: 'delete',
                                                    icon: <DeleteOutlined />,
                                                    label: 'Xóa',
                                                    danger: true,
                                                    onClick: (e) => handleDelete(notification.id, e)
                                                }
                                            ].filter(Boolean)
                                        }}
                                        placement="bottomRight"
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<MoreOutlined />}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </Dropdown>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            icon={getNotificationIcon(notification.type)}
                                            style={{
                                                backgroundColor: '#f0f0f0',
                                                border: notification.read ? 'none' : '2px solid #1890ff'
                                            }}
                                            size="small"
                                        />
                                    }
                                    title={
                                        <div style={{ marginBottom: 4 }}>
                                            <Text
                                                strong={!notification.read}
                                                style={{
                                                    fontSize: '13px',
                                                    display: 'block',
                                                    marginBottom: 2
                                                }}
                                            >
                                                {notification.title}
                                            </Text>
                                            {!notification.read && (
                                                <Badge
                                                    status="processing"
                                                    style={{
                                                        position: 'absolute',
                                                        right: 40,
                                                        top: 8
                                                    }}
                                                />
                                            )}
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <Text
                                                type={notification.read ? 'secondary' : 'default'}
                                                style={{
                                                    fontSize: '12px',
                                                    display: 'block',
                                                    marginBottom: 4,
                                                    lineHeight: '1.4'
                                                }}
                                            >
                                                {notification.message}
                                            </Text>
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: '11px' }}
                                            >
                                                {notification.timestamp.fromNow()}
                                            </Text>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                ) : (
                    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <Empty
                            description="Không có thông báo nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
                <>
                    <Divider style={{ margin: 0 }} />
                    <div style={{
                        padding: '12px 20px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa'
                    }}>
                        <Button
                            type="link"
                            onClick={handleViewAll}
                            style={{
                                fontSize: '13px',
                                height: 'auto',
                                padding: 0
                            }}
                        >
                            Xem tất cả thông báo ({notificationList.length})
                        </Button>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <Dropdown
            dropdownRender={() => dropdownContent}
            trigger={['click']}
            open={visible}
            onOpenChange={setVisible}
            placement="bottomRight"
            arrow={false}
        >
            <div onClick={(e) => e.preventDefault()}>
                <Badge count={unreadCount} size="small">
                    {children}
                </Badge>
            </div>
        </Dropdown>
    );
};

export default NotificationDropdown;