import React, { useState, useEffect } from 'react';
import {
    Badge,
    Dropdown,
    List,
    Button,
    Typography,
    Empty,
    Divider,
    Tag
} from 'antd';
import {
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text } = Typography;


const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Đặt sân thành công',
            message: 'Bạn đã đặt sân cầu lông VIP 1 vào 14:00 ngày 15/01/2024',
            type: 'success',
            time: dayjs().subtract(5, 'minutes'),
            read: false
        },
        {
            id: 2,
            title: 'Nhắc nhở thanh toán',
            message: 'Vui lòng thanh toán cho lịch đặt sân tennis lúc 16:00',
            type: 'warning',
            time: dayjs().subtract(1, 'hour'),
            read: false
        },
        {
            id: 3,
            title: 'Khuyến mãi mới',
            message: 'Giảm 20% cho tất cả sân bóng đá vào cuối tuần',
            type: 'info',
            time: dayjs().subtract(2, 'hours'),
            read: true
        }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getTypeColor = (type) => {
        const colors = {
            success: 'green',
            warning: 'orange',
            error: 'red',
            info: 'blue'
        };
        return colors[type] || 'default';
    };

    const notificationMenu = (
        <div style={{ width: 350, maxHeight: 400, overflow: 'auto' }}>
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Text strong>Thông báo</Text>
                {unreadCount > 0 && (
                    <Button
                        type="link"
                        size="small"
                        onClick={markAllAsRead}
                    >
                        Đánh dấu đã đọc
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <Empty
                    description="Không có thông báo"
                    style={{ padding: '40px 20px' }}
                />
            ) : (
                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                        <List.Item
                            style={{
                                padding: '12px 16px',
                                backgroundColor: item.read ? 'transparent' : '#f6ffed',
                                borderBottom: '1px solid #f0f0f0'
                            }}
                            actions={[
                                !item.read && (
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CheckOutlined />}
                                        onClick={() => markAsRead(item.id)}
                                    />
                                ),
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => deleteNotification(item.id)}
                                />
                            ].filter(Boolean)}
                        >
                            <List.Item.Meta
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Text strong={!item.read}>{item.title}</Text>
                                        <Tag color={getTypeColor(item.type)} size="small">
                                            {item.type}
                                        </Tag>
                                    </div>
                                }
                                description={
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.message}
                                        </Text>
                                        <div style={{ marginTop: 4 }}>
                                            <ClockCircleOutlined style={{ fontSize: 10, marginRight: 4 }} />
                                            <Text type="secondary" style={{ fontSize: 10 }}>
                                                {item.time.fromNow()}
                                            </Text>
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    return (
        <Dropdown
            overlay={notificationMenu}
            trigger={['click']}
            placement="bottomRight"
        >
            <Badge count={unreadCount} size="small">
                <Button
                    type="text"
                    icon={<BellOutlined />}
                    style={{ color: 'white' }}
                />
            </Badge>
        </Dropdown>
    );
};

export default NotificationCenter;