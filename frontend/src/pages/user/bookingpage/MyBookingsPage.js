// Trang quản lý lịch sử đặt sân của người dùng
// 1. Xử lý giao diện của page
import React, { useState, useEffect } from 'react';
import {
    Card, Table, Typography, Space, Tag, Button, Modal, Rate, Input, message, Tabs, Empty, Row, Col
} from 'antd';
import {
    CalendarOutlined, ClockCircleOutlined, DollarOutlined, StarOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';
import BookingItem from './BookingItem';
import { handleCancelBooking, formatPrice, getStatusColor, getStatusText, handleReviewBooking, handleSubmitReview } from './bookingLogic';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Component chính của trang lịch đặt sân
const MyBookingsPage = () => {
    // State quản lý tab đang chọn (sắp tới, đã hoàn thành, đã huỷ)
    const [activeTab, setActiveTab] = useState('upcoming');
    // State hiển thị modal đánh giá
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    // State lưu booking đang chọn để đánh giá
    const [selectedBooking, setSelectedBooking] = useState(null);
    // State điểm đánh giá
    const [rating, setRating] = useState(5);
    // State nội dung nhận xét
    const [review, setReview] = useState('');

    // object booking gồm 3 mảng
    const [bookings, setBookings] = useState({
        upcoming: [],
        completed: [],
        cancelled: []
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        fetch('http://localhost:8000/api/bookings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log('Received booking data:', data);
                // Phân loại booking theo status
                const upcoming = data.filter(b => b.status === 'pending');
                const completed = data.filter(b => b.status === 'confirmed');
                const cancelled = data.filter(b => b.status === 'cancelled');
                setBookings({ upcoming, completed, cancelled });
            })
            .catch(err => {
                console.error('Error fetching bookings:', err);
            });
    }, []);

    // Định nghĩa các cột cho bảng Table
    const columns = [
        {
            title: 'Mã đặt',
            dataIndex: 'id',
            key: 'id',
            width: 100
        },
        {
            title: 'Sân',
            key: 'facility',
            render: (_, record) => (
                <div>
                    <Text strong>{record.facility}</Text>
                    <br />
                    <Tag color="blue" size="small">{record.sport}</Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.location}
                    </Text>
                </div>
            )
        },
        {
            title: 'Thời gian',
            key: 'datetime',
            render: (_, record) => (
                <div>
                    <div>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(record.start_time).format('DD/MM/YYYY')}
                    </div>
                    <div>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {dayjs(record.start_time).format('HH:mm')} - {dayjs(record.end_time).format('HH:mm')}
                    </div>
                </div>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'total_price',
            key: 'total_price',
            render: (total_price) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatPrice(total_price)}
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <div>
                    <Tag color={getStatusColor(status)}>
                        {getStatusText(status)}
                    </Tag>
                    {record.refunded && (
                        <Tag color="green" size="small">Đã hoàn tiền</Tag>
                    )}
                    {record.reviewed && (
                        <Tag color="gold" size="small">Đã đánh giá</Tag>
                    )}
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    {record.canCancel && (
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleCancelBooking(record)}
                        >
                            Hủy đặt
                        </Button>
                    )}
                    {record.canReview && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<StarOutlined />}
                            onClick={() => handleReviewBooking(record, setSelectedBooking, setReviewModalVisible)}
                        >
                            Đánh giá
                        </Button>
                    )}
                    {activeTab === 'upcoming' && record.status === 'confirmed' && (
                        <Button
                            size="small"
                            icon={<EditOutlined />}
                        >
                            Đổi lịch
                        </Button>
                    )}
                </Space>
            ),
        }
    ];

    // Hiển thị thống kê số lượng booking theo từng trạng thái
    const renderBookingStats = () => {
        const stats = [
            {
                title: 'Sắp tới',
                value: bookings.upcoming.length,
                color: '#1890ff'
            },
            {
                title: 'Đã hoàn thành',
                value: bookings.completed.length,
                color: '#52c41a'
            },
            {
                title: 'Đã hủy',
                value: bookings.cancelled.length,
                color: '#ff4d4f'
            }
        ];

        return (
            <Row gutter={16} style={{ marginBottom: 24 }}>
                {stats.map((stat, index) => (
                    <Col xs={8} key={index}>
                        <Card size="small">
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: stat.color
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {stat.title}
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    // Render giao diện chính
    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Lịch đặt sân của tôi</Title>
                <Text type="secondary">Quản lý và theo dõi các lần đặt sân</Text>
            </div>

            {renderBookingStats()}
            {/* Hiển thị bảng booking theo từng tab */}
            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Sắp tới" key="upcoming">
                        {bookings.upcoming.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={bookings.upcoming} // Hiển thị các booking sắp tới
                                pagination={false}
                                scroll={{ x: 800 }}
                            />
                        ) : (
                            <Empty description="Không có lịch đặt sân nào sắp tới" />
                        )}
                    </TabPane>

                    <TabPane tab="Đã hoàn thành" key="completed">
                        {bookings.completed.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={bookings.completed} // Hiển thị các booking đã hoàn thành
                                pagination={false}
                                scroll={{ x: 800 }}
                            />
                        ) : (
                            <Empty description="Chưa có lịch đặt sân nào hoàn thành" />
                        )}
                    </TabPane>

                    <TabPane tab="Đã hủy" key="cancelled">
                        {bookings.cancelled.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={bookings.cancelled} // Hiển thị các booking đã hủy
                                pagination={false}
                                scroll={{ x: 800 }}
                            />
                        ) : (
                            <Empty description="Không có lịch đặt sân nào bị hủy" />
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            {/* Modal đánh giá sân */}
            <Modal
                title="Đánh giá sân thể thao"
                open={reviewModalVisible}
                onCancel={() => setReviewModalVisible(false)}
                onOk={() => handleSubmitReview(setReviewModalVisible, setRating, setReview)}
                okText="Gửi đánh giá"
                cancelText="Hủy"
            >
                {selectedBooking && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Sân: </Text>
                            <Text>{selectedBooking.facility}</Text>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Đánh giá: </Text>
                            <Rate value={rating} onChange={setRating} />
                        </div>

                        <div>
                            <Text strong>Nhận xét: </Text>
                            <TextArea
                                rows={4}
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về sân này..."
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyBookingsPage;