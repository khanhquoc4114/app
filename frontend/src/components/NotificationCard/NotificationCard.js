import React, { useState, useEffect } from 'react';
import {
    Card,
    List,
    Avatar,
    Typography,
    Space,
    Tag,
    Button,
    Badge,
    Dropdown,
    Empty,
    Divider,
    message
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
    CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getToken } from '../../utils/auth';
import { useNotifications } from "../../contexts/NotificationContext";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

    const NotificationCard = ({
        notifications: initialNotifications = [],
        onMarkAsRead,
        onMarkAllAsRead,
        onDelete,
        maxHeight = 400,
        showActions = true
    }) => {
    const [filter, setFilter] = useState('all');
    const [notificationList, setNotificationList] = useNotifications();
    const [userInfo, setUserInfo] = useState(null);


    useEffect(() => {
        const fetchNotifications = async () => {
            const token = getToken();
            if (!token) return;

            const res = await fetch("http://localhost:8000/api/notifications", {
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
    }, []);

    const mockNotifications = [
        {
            id: 1,
            type: 'booking_confirmed',
            title: 'Mock title',
            message: 'Mock message',
            timestamp: dayjs().subtract(5, 'minute'),
            read: false,
            priority: 'high',
            data: {
                bookingId: 'BK001',
                facilityName: 'Sân cầu lông VIP 1'
            }
        }
    ];

    const allNotifications = notificationList.length >= 0 ? notificationList : mockNotifications;

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

    const getPriorityColor = (priority) => {
        const colors = {
            high: '#ff4d4f',
            medium: '#faad14',
            low: '#52c41a'
        };
        return colors[priority] || '#d9d9d9';
    };

    const getPriorityText = (priority) => {
        const texts = {
            high: 'Cao',
            medium: 'Trung bình',
            low: 'Thấp'
        };
        return texts[priority] || 'Thường';
    };

    const filteredNotifications = allNotifications.filter(notification => {
        if (filter === 'unread') return !notification.read;
        if (filter === 'read') return notification.read;
        return true;
    });

    const unreadCount = allNotifications.filter(n => !n.read).length;

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

    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch(
            `${process.env.REACT_APP_API_URL}/api/notifications/mark-all-read`,
            { method: "PATCH" }
            );

            if (!res.ok) throw new Error("Failed to mark all as read");

            // Update local state
            setNotificationList((prev) =>
            prev.map((n) => ({ ...n, read: true }))
            );

            if (onMarkAllAsRead) {
            onMarkAllAsRead();
            }
        } catch (err) {
            console.error("Lỗi khi mark all as read:", err);
        }
    };

    const handleDelete = async (notificationId) => {
        const token = getToken();
        const res = await fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.ok) {
            message.success("Xoá thông báo thành công!");
            setNotificationList(prev => prev.filter(n => n.id !== notificationId));
        } else {
            message.error("Không thể xoá thông báo");
        }
    };

    const filterButtons = [
        { key: 'all', label: 'Tất cả', count: allNotifications.length },
        { key: 'unread', label: 'Chưa đọc', count: unreadCount },
        { key: 'read', label: 'Đã đọc', count: allNotifications.length - unreadCount }
    ];

    return (
        <Card
            title={
                <Space>
                    <BellOutlined />
                    <span>Thông báo</span>
                    {unreadCount > 0 && (
                        <Badge count={unreadCount} size="small" />
                    )}
                </Space>
            }
            extra={
                showActions && unreadCount > 0 && (
                    <Button
                        type="link"
                        size="small"
                        onClick={handleMarkAllAsRead}
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                )
            }
            bodyStyle={{ padding: 0 }}
        >
            {/* Filter buttons */}
            <div style={{ padding: '16px 16px 0 16px' }}>
                <Space>
                    {filterButtons.map(btn => (
                        <Button
                            key={btn.key}
                            type={filter === btn.key ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setFilter(btn.key)}
                        >
                            {btn.label} ({btn.count})
                        </Button>
                    ))}
                </Space>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            {/* Notifications list */}
            <div style={{ maxHeight, overflowY: 'auto' }}>
                {filteredNotifications.length > 0 ? (
                    <List
                        dataSource={filteredNotifications}
                        renderItem={(notification) => (
                            <List.Item
                                style={{
                                    padding: '12px 16px',
                                    backgroundColor: notification.read ? '#fff' : '#f6ffed',
                                    borderLeft: `3px solid ${getPriorityColor(notification.priority)}`
                                }}
                                actions={showActions ? [
                                    !notification.read && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<CheckOutlined />}
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            Đánh dấu đã đọc
                                        </Button>
                                    ),
                                    <Button
                                        type="link"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(notification.id)}
                                    >
                                        Xóa
                                    </Button>
                                ].filter(Boolean) : []}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            icon={getNotificationIcon(notification.type)}
                                            style={{ backgroundColor: '#f0f0f0' }}
                                        />
                                    }
                                    title={
                                        <Space>
                                            <Text strong={!notification.read}>
                                                {notification.title}
                                            </Text>
                                            <Tag
                                                color={getPriorityColor(notification.priority)}
                                                size="small"
                                            >
                                                {getPriorityText(notification.priority)}
                                            </Tag>
                                            {!notification.read && (
                                                <Badge status="processing" />
                                            )}
                                        </Space>
                                    }
                                    description={
                                        <div>
                                            <Text
                                                type={notification.read ? 'secondary' : 'default'}
                                                style={{ fontSize: '13px' }}
                                            >
                                                {notification.message}
                                            </Text>
                                            <br />
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
                    <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                        <Empty
                            description={
                                filter === 'unread' ? 'Không có thông báo chưa đọc' :
                                    filter === 'read' ? 'Không có thông báo đã đọc' :
                                        'Không có thông báo nào'
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}
            </div>
        </Card>
    );
};

export default NotificationCard;