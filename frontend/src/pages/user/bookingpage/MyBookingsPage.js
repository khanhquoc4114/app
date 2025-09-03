import { useState, useEffect } from 'react';
import {
    Card, Typography, Space, Tag, Button, Modal, Rate, Input, Tabs, Empty, Row, Col
} from 'antd';
import {
    CalendarOutlined, ClockCircleOutlined, StarOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';

import dayjs from 'dayjs';
import { handleCancelBooking, formatPrice, getStatusColor, getStatusText, handleReviewBooking, handleSubmitReview } from './bookingLogic';
import { getSportName } from '../../../utils/sportsName';



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

        fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
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

    // Component bảng HTML thuần thay thế Ant Design Table
    const CustomTable = ({ data, title }) => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                <thead>
                    <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #f0f0f0' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#262626' }}>
                            Mã đặt
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#262626' }}>
                            Thông tin sân
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#262626' }}>
                            Thời gian
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#262626' }}>
                            Số tiền
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#262626' }}>
                            Trạng thái
                        </th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 'bold', color: '#262626' }}>
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((record, index) => (
                        <tr key={record.id} style={{ 
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa'
                        }}>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                <Text strong>{record.id}</Text>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', marginBottom: 4, color: '#262626' }}>
                                        {record.facility}
                                    </div>
                                    <div style={{ marginBottom: 2 }}>
                                        <span style={{
                                            fontSize: '11px',
                                            backgroundColor: '#e6f7ff',
                                            color: '#1890ff',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            border: '1px solid #91d5ff',
                                            display: 'inline-block'
                                        }}>
                                         {getSportName(record.sport_type)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        📍 {record.location}
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                <div>
                                    <div style={{ marginBottom: 4 }}>
                                        <CalendarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                        {dayjs(record.start_time).format('DD/MM/YYYY')}
                                    </div>
                                    <div>
                                        <ClockCircleOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                        {dayjs(record.start_time).format('HH:mm')} - {dayjs(record.end_time).format('HH:mm')}
                                    </div>
                                </div>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                                    {formatPrice(record.total_price)}
                                </Text>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
                                <div>
                                    <Tag color={getStatusColor(record.status)}>
                                        {getStatusText(record.status)}
                                    </Tag>
                                    {record.refunded && (
                                        <Tag color="green" size="small" style={{ marginTop: 4, display: 'block', width: 'fit-content' }}>
                                            Đã hoàn tiền
                                        </Tag>
                                    )}
                                    {record.reviewed && (
                                        <Tag color="gold" size="small" style={{ marginTop: 4, display: 'block', width: 'fit-content' }}>
                                            Đã đánh giá
                                        </Tag>
                                    )}
                                </div>
                            </td>
                            <td style={{ padding: '12px 16px', verticalAlign: 'top' }}>
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

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
                            <CustomTable data={bookings.upcoming} title="Sắp tới" />
                        ) : (
                            <Empty description="Không có lịch đặt sân nào sắp tới" />
                        )}
                    </TabPane>

                    <TabPane tab="Đã hoàn thành" key="completed">
                        {bookings.completed.length > 0 ? (
                            <CustomTable data={bookings.completed} title="Đã hoàn thành" />
                        ) : (
                            <Empty description="Chưa có lịch đặt sân nào hoàn thành" />
                        )}
                    </TabPane>

                    <TabPane tab="Đã hủy" key="cancelled">
                        {bookings.cancelled.length > 0 ? (
                            <CustomTable data={bookings.cancelled} title="Đã hủy" />
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