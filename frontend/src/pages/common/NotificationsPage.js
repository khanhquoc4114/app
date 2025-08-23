import React from 'react';
import { Row, Col, Typography, message, Button, Space } from 'antd';
import { BellOutlined, PlusOutlined } from '@ant-design/icons';
import NotificationCard from '../../components/NotificationCard/NotificationCard';
import dayjs from 'dayjs';
import { useNotifications } from "../../contexts/NotificationContext";

const { Title, Text } = Typography;

const NotificationsPage = () => {
    const [notifications, setNotifications] = useNotifications();

    const handleMarkAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
        message.success('Đã đánh dấu thông báo là đã đọc');
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notification => ({ ...notification, read: true }))
        );
        message.success('Đã đánh dấu tất cả thông báo là đã đọc');
    };

    const handleDelete = (notificationId) => {
        setNotifications(prev =>
            prev.filter(notification => notification.id !== notificationId)
        );
        message.success('Đã xóa thông báo');
    };

    const addSampleNotification = () => {
        const sampleNotifications = [
            {
                id: Date.now(),
                type: 'booking_confirmed',
                title: 'Đặt sân mới thành công',
                message: `Đặt sân bóng đá mini vào ngày ${dayjs().add(1, 'day').format('DD/MM/YYYY')} lúc 18:00-20:00 đã được xác nhận.`,
                timestamp: dayjs(),
                read: false,
                priority: 'high'
            },
            {
                id: Date.now() + 1,
                type: 'payment_success',
                title: 'Thanh toán thành công',
                message: 'Thanh toán 400,000 VNĐ cho đặt sân đã được xử lý thành công qua MoMo.',
                timestamp: dayjs().subtract(2, 'minute'),
                read: false,
                priority: 'medium'
            },
            {
                id: Date.now() + 2,
                type: 'promotion',
                title: 'Ưu đãi cuối tuần',
                message: 'Giảm 15% cho tất cả sân tennis. Áp dụng từ thứ 7 đến chủ nhật tuần này.',
                timestamp: dayjs().subtract(30, 'minute'),
                read: false,
                priority: 'low'
            }
        ];

        setNotifications(prev => [...sampleNotifications, ...prev]);
        message.success('Đã thêm thông báo mẫu');
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    <BellOutlined style={{ marginRight: 8 }} />
                    Trung tâm thông báo
                </Title>
                <Text type="secondary">
                    Quản lý và theo dõi tất cả thông báo của bạn
                </Text>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addSampleNotification}
                    >
                        Thêm thông báo mẫu
                    </Button>
                </Space>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <NotificationCard
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                        onDelete={handleDelete}
                        maxHeight={600}
                        showActions={true}
                    />
                </Col>

                <Col xs={24} lg={8}>
                    <div style={{
                        background: '#f6f6f6',
                        padding: '20px',
                        borderRadius: '8px',
                        height: 'fit-content'
                    }}>
                        <Title level={4}>Hướng dẫn sử dụng</Title>

                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Các loại thông báo:</Text>
                            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                                <li>🟢 <strong>Đặt sân:</strong> Xác nhận, hủy, nhắc nhở</li>
                                <li>💰 <strong>Thanh toán:</strong> Thành công, thất bại</li>
                                <li>🎯 <strong>Khuyến mãi:</strong> Ưu đãi, giảm giá</li>
                                <li>⚙️ <strong>Hệ thống:</strong> Bảo trì, cập nhật</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Mức độ ưu tiên:</Text>
                            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                                <li><span style={{ color: '#ff4d4f' }}>●</span> <strong>Cao:</strong> Cần xử lý ngay</li>
                                <li><span style={{ color: '#faad14' }}>●</span> <strong>Trung bình:</strong> Quan trọng</li>
                                <li><span style={{ color: '#52c41a' }}>●</span> <strong>Thấp:</strong> Thông tin</li>
                            </ul>
                        </div>

                        <div>
                            <Text strong>Tính năng:</Text>
                            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                                <li>Lọc theo trạng thái đọc</li>
                                <li>Đánh dấu đã đọc</li>
                                <li>Xóa thông báo</li>
                                <li>Hiển thị thời gian tương đối</li>
                                <li>Phân loại theo mức độ ưu tiên</li>
                            </ul>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default NotificationsPage;