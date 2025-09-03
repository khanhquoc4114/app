import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Typography, Button,
    Steps, Alert, message, Divider, Space, Spin
} from 'antd';
import {
    CreditCardOutlined, CheckCircleOutlined, ClockCircleOutlined,
    EnvironmentOutlined, CalendarOutlined, DollarOutlined, QrcodeOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Step } = Steps;

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const bookingData = location.state?.bookingData;

    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [orderCode, setOrderCode] = useState(null);

    /** =======================
     *  Format giá tiền
     * =======================
     */
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    /** =======================
     *  Tạo payment link
     * =======================
     */
    const handleCreatePayment = async () => {
        if (!bookingData) {
            message.error('Thông tin đặt sân không hợp lệ');
            return;
        }

        setLoading(true);
        setCurrentStep(1);
        setPaymentStatus('processing');

        try {
            const token = localStorage.getItem('token');
            const order_code = new Date().toISOString().slice(2,19).replace(/[-T:]/g,'')
            setOrderCode(order_code);
            const paymentRequestData = {
                // Tạo order_code dạng yymmddhhmmss
                order_code: order_code,
                facility_name: bookingData.facility,
                sport_type: bookingData.sport_type,
                booking_date: bookingData.booking_date,
                total_price: bookingData.total_price,
            };

            console.log('Creating payment with data:', paymentRequestData);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/create-payment-link`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(paymentRequestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Backend error response:', errorData);
                const errorMsg = errorData.detail
                    ? (typeof errorData.detail === 'object' ? JSON.stringify(errorData.detail) : errorData.detail)
                    : 'Không thể tạo thanh toán';

                throw new Error(errorMsg);            
            }

            const result = await response.json();

            if (result.success) {
                setQrCodeImage(result.qr_code_image);
                setPaymentStatus('ready');
                setLoading(false);

                message.success('QR Code thanh toán đã sẵn sàng!');
            } else {
                throw new Error('Không thể tạo link thanh toán');
            }
        } catch (error) {
            console.error('Payment error:', error);
            message.error(`Lỗi thanh toán: ${error.message}`);
            setLoading(false);
            setPaymentStatus('failed');
            setCurrentStep(0);
        }
    };

    /** =======================
     *  Hủy thanh toán
     * =======================
     */
    const handleCancelPayment = () => {
        navigate(-1);
    };
    /** =======================
     *  Check URL params cho status payment
     * =======================
     */
useEffect(() => {
    let interval;
    if (orderCode && paymentStatus === 'ready') {
        interval = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/check-status/${orderCode}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.status === 'success') {
                    setPaymentStatus('success');
                    setCurrentStep(2);
                    message.success('Thanh toán thành công!');
                    clearInterval(interval);
                    setTimeout(() => navigate('/my-bookings'), 3000);
                } else if (data.status === 'failed') {
                    setPaymentStatus('failed');
                    clearInterval(interval);
                    message.error('Thanh toán thất bại. Vui lòng thử lại.');
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 3000); // 3 giây kiểm tra 1 lần
    }
    return () => clearInterval(interval);
}, [orderCode, paymentStatus, navigate]);

    /** =======================
     *  Tạo payment tự động khi load page
     * =======================
     */
    useEffect(() => {
        if (!bookingData) {
            message.error('Không tìm thấy thông tin đặt sân');
            navigate('/facilities');
            return;
        }

        handleCreatePayment();
    }, [bookingData, navigate]);

    if (!bookingData) {
        return <div>Loading...</div>;
    }

    /** =======================
     *  JSX render
     * =======================
     */
    return (
        <div style={{ padding: '0px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>Thanh toán đặt sân</Title>

            <Steps current={currentStep} style={{ marginBottom: 32 }}>
                <Step title="Xác nhận thông tin" icon={<CreditCardOutlined />} />
                <Step title="Thanh toán" icon={<ClockCircleOutlined />} />
                <Step title="Hoàn thành" icon={<CheckCircleOutlined />} />
            </Steps>

            <Row gutter={24}>
                <Col xs={24} lg={10}>
                    <Card title="Thông tin đặt sân" style={{ marginBottom: 24 }}>
                        <Space direction="vertical" size={16} style={{ width: '100%' }}>
                            <div>
                                <Space>
                                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                    <div>
                                        <Text strong>Sân thể thao:</Text>
                                        <br />
                                        <Text style={{ fontSize: '16px' }}>{bookingData.facility}</Text>
                                    </div>
                                </Space>
                            </div>

                            <div>
                                <Space>
                                    <CalendarOutlined style={{ color: '#52c41a' }} />
                                    <div>
                                        <Text strong>Thời gian:</Text>
                                        <br />
                                        <Text>
                                            {dayjs(bookingData.start_time).format('DD/MM/YYYY HH:mm')} -
                                            {dayjs(bookingData.end_time).format('HH:mm')}
                                        </Text>
                                        <br />
                                        <Text type="secondary">
                                            Khung giờ: {bookingData.time_slots.join(', ')}
                                        </Text>
                                    </div>
                                </Space>
                            </div>

                            {bookingData.court_name && (
                                <div>
                                    <Text strong>Sân:</Text>
                                    <br />
                                    <Text>{bookingData.court_name}</Text>
                                </div>
                            )}

                            <div>
                                <Text strong>Địa điểm:</Text>
                                <br />
                                <Text>{bookingData.location}</Text>
                            </div>

                            <Divider />

                            <div style={{ background: '#f6ffed', padding: '12px', borderRadius: '6px', border: '1px solid #b7eb8f' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space>
                                        <DollarOutlined style={{ color: '#52c41a' }} />
                                        <Text strong>Tổng tiền:</Text>
                                    </Space>
                                    <Text strong style={{ color: '#52c41a', fontSize: '20px' }}>
                                        {formatPrice(bookingData.total_price)}
                                    </Text>
                                </div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {bookingData.time_slots.length} giờ × {formatPrice(bookingData.total_price / bookingData.time_slots.length)}/giờ
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card title={
                        <Space>
                            <QrcodeOutlined />
                            <span>Thanh toán qua QR Code</span>
                            {paymentData?.is_mock && <Text type="secondary" style={{ fontSize: '12px' }}>(Demo)</Text>}
                        </Space>
                    }>
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Spin size="large" />
                                <div style={{ marginTop: 16 }}>
                                    <Text>Đang tạo mã QR thanh toán...</Text>
                                </div>
                            </div>
                        )}

                        {paymentStatus === 'ready' && qrCodeImage && (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ marginBottom: 24 }}>
                                    <img
                                        src={qrCodeImage}
                                        alt="QR Code Payment"
                                        style={{
                                            width: '250px',
                                            height: '250px',
                                            border: '2px solid #1890ff',
                                            borderRadius: '8px',
                                            padding: '8px',
                                            backgroundColor: '#fff'
                                        }}
                                    />
                                </div>

                                <Alert
                                    message="Hướng dẫn thanh toán"
                                    description={
                                        <div style={{ textAlign: 'left' }}>
                                            <div>📱 <strong>Bước 1:</strong> Mở app Ngân hàng/Ví điện tử</div>
                                            <div>📷 <strong>Bước 2:</strong> Quét mã QR phía trên</div>
                                            <div>💰 <strong>Bước 3:</strong> Xác nhận thanh toán {formatPrice(bookingData.total_price)}</div>
                                            <div>✅ <strong>Bước 4:</strong> Chờ xác nhận và hoàn tất</div>
                                        </div>
                                    }
                                    type="info"
                                    style={{ marginBottom: 16, textAlign: 'left' }}
                                />

                                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                                    <Button
                                        size="large"
                                        onClick={handleCancelPayment}
                                        style={{ width: '100%' }}
                                    >
                                        Hủy và quay lại
                                    </Button>
                                </Space>
                            </div>
                        )}

                        {paymentStatus === 'success' && (
                            <Alert
                                message="Thanh toán thành công!"
                                description="Đặt sân của bạn đã được xác nhận. Đang chuyển về trang quản lý đặt sân..."
                                type="success"
                                showIcon
                            />
                        )}

                        {paymentStatus === 'failed' && (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Alert
                                    message="Không thể tạo thanh toán"
                                    description="Vui lòng thử lại hoặc liên hệ hỗ trợ nếu có vấn đề."
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                <Button type="primary" onClick={handleCreatePayment}>
                                    Thử lại
                                </Button>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PaymentPage;
