import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Button,
    DatePicker,
    TimePicker,
    Form,
    Input,
    Modal,
    Typography,
    Space,
    Tag,
    Divider,
    message,
    Spin
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const BookingPage = () => {
    const { facilityId } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const [facility, setFacility] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Mock facility data
    const mockFacility = {
        id: 1,
        name: 'Sân cầu lông VIP 1',
        sport: 'badminton',
        sportName: 'Cầu lông',
        price: 80000,
        location: 'Quận 1, TP.HCM',
        image: '🏸',
        amenities: ['Điều hòa', 'Thay đồ', 'Nước uống'],
        openTime: '06:00',
        closeTime: '22:00',
        description: 'Sân cầu lông chất lượng cao với hệ thống chiếu sáng hiện đại, sàn gỗ chuyên nghiệp.'
    };

    // Generate time slots
    const generateTimeSlots = () => {
        const slots = [];
        const start = dayjs().hour(6).minute(0).second(0);
        const end = dayjs().hour(22).minute(0).second(0);

        while (start.isBefore(end)) {
            slots.push({
                time: start.format('HH:mm'),
                display: `${start.format('HH:mm')} - ${start.add(1, 'hour').format('HH:mm')}`,
                available: true
            });
        }
        return slots;
    };

    const [timeSlots, setTimeSlots] = useState(generateTimeSlots());

    useEffect(() => {
        // Simulate API call to get facility details
        setLoading(true);
        setTimeout(() => {
            setFacility(mockFacility);
            setLoading(false);
        }, 1000);

        // Simulate real-time booking updates
        const interval = setInterval(() => {
            // Random booking simulation
            if (Math.random() > 0.8) {
                const randomSlot = Math.floor(Math.random() * timeSlots.length);
                setBookedSlots(prev => [...prev, timeSlots[randomSlot]?.time]);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [facilityId]);

    const handleTimeSlotClick = (slot) => {
        if (bookedSlots.includes(slot.time)) return;

        setSelectedTimeSlots(prev => {
            if (prev.includes(slot.time)) {
                return prev.filter(time => time !== slot.time);
            } else {
                return [...prev, slot.time];
            }
        });
    };

    const calculateTotal = () => {
        return selectedTimeSlots.length * facility?.price || 0;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleBooking = () => {
        if (selectedTimeSlots.length === 0) {
            message.warning('Vui lòng chọn ít nhất một khung giờ');
            return;
        }
        setBookingModalVisible(true);
    };

    const handleSubmitBooking = async (values) => {
        setSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            message.success('Đặt sân thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
            setSubmitting(false);
            setBookingModalVisible(false);
            navigate('/');
        }, 2000);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Đang tải thông tin sân...</div>
            </div>
        );
    }

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card>
                        <div style={{ marginBottom: 24 }}>
                            <Space size={16}>
                                <div style={{ fontSize: '48px' }}>{facility.image}</div>
                                <div>
                                    <Title level={3} style={{ margin: 0 }}>
                                        {facility.name}
                                    </Title>
                                    <Tag color="blue">{facility.sportName}</Tag>
                                    <div style={{ marginTop: 8 }}>
                                        <Text type="secondary">{facility.location}</Text>
                                    </div>
                                </div>
                            </Space>
                        </div>

                        <Divider />

                        <div style={{ marginBottom: 24 }}>
                            <Title level={4}>Chọn ngày</Title>
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Title level={4}>Chọn khung giờ</Title>
                            <div className="booking-calendar">
                                <Row gutter={[8, 8]}>
                                    {timeSlots.map((slot, index) => {
                                        const isBooked = bookedSlots.includes(slot.time);
                                        const isSelected = selectedTimeSlots.includes(slot.time);

                                        return (
                                            <Col xs={12} sm={8} md={6} key={index}>
                                                <div
                                                    className={`time-slot ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleTimeSlotClick(slot)}
                                                >
                                                    {slot.display}
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <Title level={4}>Tiện ích</Title>
                            <Space wrap>
                                {facility.amenities.map((amenity, index) => (
                                    <Tag key={index} color="green">{amenity}</Tag>
                                ))}
                            </Space>
                        </div>

                        <div>
                            <Title level={4}>Mô tả</Title>
                            <Text>{facility.description}</Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title="Thông tin đặt sân"
                        style={{
                            position: window.innerWidth > 992 ? 'sticky' : 'static',
                            top: 24
                        }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size={16}>
                            <div>
                                <Text strong>Sân:</Text>
                                <div>{facility.name}</div>
                            </div>

                            <div>
                                <CalendarOutlined style={{ marginRight: 8 }} />
                                <Text strong>Ngày:</Text>
                                <div>{selectedDate.format('DD/MM/YYYY')}</div>
                            </div>

                            <div>
                                <ClockCircleOutlined style={{ marginRight: 8 }} />
                                <Text strong>Khung giờ đã chọn:</Text>
                                <div>
                                    {selectedTimeSlots.length === 0 ? (
                                        <Text type="secondary">Chưa chọn khung giờ</Text>
                                    ) : (
                                        selectedTimeSlots.map((time, index) => (
                                            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                                                {time} - {dayjs(time, 'HH:mm').add(1, 'hour').format('HH:mm')}
                                            </Tag>
                                        ))
                                    )}
                                </div>
                            </div>

                            <Divider />

                            <div>
                                <Row justify="space-between">
                                    <Text>Giá mỗi giờ:</Text>
                                    <Text>{formatPrice(facility.price)}</Text>
                                </Row>
                                <Row justify="space-between">
                                    <Text>Số giờ:</Text>
                                    <Text>{selectedTimeSlots.length}</Text>
                                </Row>
                                <Row justify="space-between">
                                    <Text strong>Tổng cộng:</Text>
                                    <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>
                                        {formatPrice(calculateTotal())}
                                    </Text>
                                </Row>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                block
                                onClick={handleBooking}
                                disabled={selectedTimeSlots.length === 0}
                            >
                                Đặt sân ngay
                            </Button>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Xác nhận đặt sân"
                open={bookingModalVisible}
                onCancel={() => setBookingModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmitBooking}
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item
                        name="note"
                        label="Ghi chú (tùy chọn)"
                    >
                        <TextArea rows={3} placeholder="Ghi chú thêm..." />
                    </Form.Item>

                    <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                        <Title level={5}>Thông tin đặt sân</Title>
                        <Text>Sân: {facility.name}</Text><br />
                        <Text>Ngày: {selectedDate.format('DD/MM/YYYY')}</Text><br />
                        <Text>Giờ: {selectedTimeSlots.join(', ')}</Text><br />
                        <Text strong>Tổng tiền: {formatPrice(calculateTotal())}</Text>
                    </div>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setBookingModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting}>
                                Xác nhận đặt sân
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default BookingPage;