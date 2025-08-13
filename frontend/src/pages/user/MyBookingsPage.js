import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Typography,
    Space,
    Tag,
    Button,
    Modal,
    Rate,
    Input,
    message,
    Tabs,
    Empty,
    Row,
    Col
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    StarOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

const MyBookingsPage = () => {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');

    // Mock data
    const bookings = {
        upcoming: [
            {
                key: '1',
                id: 'BK001',
                facility: 'Sân cầu lông VIP 1',
                sport: 'Cầu lông',
                date: '2024-01-20',
                time: '08:00 - 10:00',
                amount: 160000,
                status: 'confirmed',
                canCancel: true,
                location: 'Quận 1, TP.HCM'
            },
            {
                key: '2',
                id: 'BK002',
                facility: 'Sân tennis cao cấp',
                sport: 'Tennis',
                date: '2024-01-22',
                time: '14:00 - 16:00',
                amount: 300000,
                status: 'pending',
                canCancel: true,
                location: 'Quận 7, TP.HCM'
            }
        ],
        completed: [
            {
                key: '3',
                id: 'BK003',
                facility: 'Sân bóng đá mini A',
                sport: 'Bóng đá',
                date: '2024-01-10',
                time: '18:00 - 20:00',
                amount: 400000,
                status: 'completed',
                canReview: true,
                location: 'Quận 3, TP.HCM'
            },
            {
                key: '4',
                id: 'BK004',
                facility: 'Sân bóng rổ trong nhà',
                sport: 'Bóng rổ',
                date: '2024-01-08',
                time: '09:00 - 11:00',
                amount: 240000,
                status: 'completed',
                canReview: false,
                reviewed: true,
                location: 'Quận 10, TP.HCM'
            }
        ],
        cancelled: [
            {
                key: '5',
                id: 'BK005',
                facility: 'Sân cầu lông VIP 2',
                sport: 'Cầu lông',
                date: '2024-01-05',
                time: '16:00 - 18:00',
                amount: 160000,
                status: 'cancelled',
                refunded: true,
                location: 'Quận 1, TP.HCM'
            }
        ]
    };

    const handleCancelBooking = (record) => {
        Modal.confirm({
            title: 'Xác nhận hủy đặt sân',
            content: `Bạn có chắc muốn hủy đặt sân ${record.id}? Phí hủy có thể được áp dụng.`,
            okText: 'Hủy đặt sân',
            cancelText: 'Không',
            onOk: () => {
                message.success(`Đã hủy đặt sân ${record.id}`);
            }
        });
    };

    const handleReviewBooking = (record) => {
        setSelectedBooking(record);
        setReviewModalVisible(true);
    };

    const handleSubmitReview = () => {
        message.success('Cảm ơn bạn đã đánh giá!');
        setReviewModalVisible(false);
        setRating(5);
        setReview('');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

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
                        {dayjs(record.date).format('DD/MM/YYYY')}
                    </div>
                    <div>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {record.time}
                    </div>
                </div>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatPrice(amount)}
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
                            onClick={() => handleReviewBooking(record)}
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

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Lịch đặt sân của tôi</Title>
                <Text type="secondary">Quản lý và theo dõi các lần đặt sân</Text>
            </div>

            {renderBookingStats()}

            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Sắp tới" key="upcoming">
                        {bookings.upcoming.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={bookings.upcoming}
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
                                dataSource={bookings.completed}
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
                                dataSource={bookings.cancelled}
                                pagination={false}
                                scroll={{ x: 800 }}
                            />
                        ) : (
                            <Empty description="Không có lịch đặt sân nào bị hủy" />
                        )}
                    </TabPane>
                </Tabs>
            </Card>

            <Modal
                title="Đánh giá sân thể thao"
                open={reviewModalVisible}
                onCancel={() => setReviewModalVisible(false)}
                onOk={handleSubmitReview}
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