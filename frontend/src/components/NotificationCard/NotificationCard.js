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
    CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

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
    const [notificationList, setNotificationList] = useState(initialNotifications);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications`);
                const data = await res.json();
                const parsed = data.map(n => ({
                    ...n,
                    timestamp: dayjs(n.timestamp)
                }));

                setNotificationList(parsed);
            } catch (err) {
                console.error("Lỗi fetch notifications:", err);
            }
        };

        fetchNotifications();
    }, []);

    // // Mock notifications data
    const mockNotifications = [
        {
            id: 1,
            type: 'booking_confirmed',
            title: 'Đặt sân thành công',
            message: 'Đặt sân cầu lông VIP 1 vào ngày 20/01/2024 lúc 08:00-10:00 đã được xác nhận.',
            timestamp: dayjs().subtract(5, 'minute'),
            read: false,
            priority: 'high',
            data: {
                bookingId: 'BK001',
                facilityName: 'Sân cầu lông VIP 1'
            }
        },
        {
            id: 2,
            type: 'payment_success',
            title: 'Thanh toán thành công',
            message: 'Thanh toán 160,000 VNĐ cho đặt sân BK001 đã được xử lý thành công.',
            timestamp: dayjs().subtract(10, 'minute'),
            read: false,
            priority: 'medium',
            data: {
                amount: 160000,
                bookingId: 'BK001'
            }
        },
        {
            id: 3,
            type: 'booking_reminder',
            title: 'Nhắc nhở đặt sân',
            message: 'Bạn có lịch đặt sân tennis vào 14:00 hôm nay. Vui lòng đến đúng giờ.',
            timestamp: dayjs().subtract(1, 'hour'),
            read: true,
            priority: 'medium',
            data: {
                facilityName: 'Sân tennis cao cấp',
                time: '14:00'
            }
        },
        {
            id: 4,
            type: 'promotion',
            title: 'Khuyến mãi đặc biệt',
            message: 'Giảm 20% cho tất cả sân cầu lông vào cuối tuần. Áp dụng từ 22-23/01/2024.',
            timestamp: dayjs().subtract(2, 'hour'),
            read: true,
            priority: 'low',
            data: {
                discount: 20,
                validUntil: '23/01/2024'
            }
        },
        {
            id: 5,
            type: 'system',
            title: 'Bảo trì hệ thống',
            message: 'Hệ thống sẽ bảo trì từ 02:00-04:00 ngày 21/01/2024. Vui lòng hoàn tất giao dịch trước thời gian này.',
            timestamp: dayjs().subtract(1, 'day'),
            read: false,
            priority: 'high',
            data: {
                maintenanceTime: '02:00-04:00',
                date: '21/01/2024'
            }
        }
    ];

    // const allNotifications = notifications.length > 0 ? notifications : mockNotifications;
    const allNotifications = notificationList.length > 0 ? notificationList : mockNotifications;

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

    // Cập nhật local state (notificationList)
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


    const handleMarkAllAsRead = () => {
        if (onMarkAllAsRead) {
            onMarkAllAsRead();
        }
    };

    const handleDelete = (notificationId) => {
        if (onDelete) {
            onDelete(notificationId);
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