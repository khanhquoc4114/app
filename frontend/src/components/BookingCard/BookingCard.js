import React from 'react';
import { Card, Tag, Button, Space, Typography, Rate } from 'antd';
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;
const { Meta } = Card;

const BookingCard = ({
    booking,
    onViewDetails,
    onCancel,
    onReview,
    onReschedule,
    showActions = true
}) => {
    const getStatusColor = (status) => {
        const colors = {
            confirmed: 'green',
            pending: 'orange',
            completed: 'blue',
            cancelled: 'red'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            confirmed: 'Đã xác nhận',
            pending: 'Chờ xác nhận',
            completed: 'Đã hoàn thành',
            cancelled: 'Đã hủy'
        };
        return texts[status] || status;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getSportIcon = (sportType) => {
        const icons = {
            badminton: '🏸',
            football: '⚽',
            tennis: '🎾',
            basketball: '🏀'
        };
        return icons[sportType] || '🏃';
    };

    const renderActions = () => {
        if (!showActions) return null;

        const actions = [];

        if (booking.status === 'pending' || booking.status === 'confirmed') {
            if (booking.canCancel) {
                actions.push(
                    <Button
                        key="cancel"
                        size="small"
                        danger
                        onClick={() => onCancel?.(booking)}
                    >
                        Hủy đặt
                    </Button>
                );
            }

            if (booking.status === 'confirmed') {
                actions.push(
                    <Button
                        key="reschedule"
                        size="small"
                        onClick={() => onReschedule?.(booking)}
                    >
                        Đổi lịch
                    </Button>
                );
            }
        }

        if (booking.status === 'completed' && booking.canReview) {
            actions.push(
                <Button
                    key="review"
                    size="small"
                    type="primary"
                    onClick={() => onReview?.(booking)}
                >
                    Đánh giá
                </Button>
            );
        }

        actions.push(
            <Button
                key="details"
                size="small"
                onClick={() => onViewDetails?.(booking)}
            >
                Chi tiết
            </Button>
        );

        return actions;
    };

    return (
        <Card
            hoverable
            style={{ marginBottom: 16 }}
            cover={
                <div style={{
                    height: 120,
                    background: 'linear-gradient(45deg, #f0f2f5, #d9d9d9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    position: 'relative'
                }}>
                    {getSportIcon(booking.sport)}
                    <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8
                    }}>
                        <Tag color={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                        </Tag>
                    </div>
                </div>
            }
            actions={renderActions()}
        >
            <Meta
                title={
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
                            {booking.facility}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Mã đặt: {booking.id}
                        </Text>
                    </div>
                }
                description={
                    <div>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <div>
                                <CalendarOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                <Text>{dayjs(booking.date).format('DD/MM/YYYY')}</Text>
                            </div>

                            <div>
                                <ClockCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                                <Text>{booking.time}</Text>
                            </div>

                            <div>
                                <EnvironmentOutlined style={{ marginRight: 8, color: '#faad14' }} />
                                <Text>{booking.location}</Text>
                            </div>

                            <div>
                                <DollarOutlined style={{ marginRight: 8, color: '#f5222d' }} />
                                <Text strong style={{ color: '#1890ff' }}>
                                    {formatPrice(booking.amount)}
                                </Text>
                            </div>

                            {booking.notes && (
                                <div style={{ marginTop: 8 }}>
                                    <Paragraph
                                        ellipsis={{ rows: 2 }}
                                        style={{
                                            fontSize: '12px',
                                            color: '#666',
                                            margin: 0,
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        Ghi chú: {booking.notes}
                                    </Paragraph>
                                </div>
                            )}

                            {booking.rating && (
                                <div style={{ marginTop: 8 }}>
                                    <Rate
                                        disabled
                                        defaultValue={booking.rating}
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Text style={{ marginLeft: 8, fontSize: '12px' }}>
                                        Đã đánh giá
                                    </Text>
                                </div>
                            )}

                            {booking.refunded && (
                                <div style={{ marginTop: 8 }}>
                                    <Tag color="green" size="small">
                                        Đã hoàn tiền
                                    </Tag>
                                </div>
                            )}
                        </Space>
                    </div>
                }
            />
        </Card>
    );
};

export default BookingCard;