import React, { useState, useEffect } from 'react';
import {
    Card, Row, Col, Typography, Button, Radio, Input, Form, Modal, QRCode,
    Steps, Alert, Spin, message, Divider, Space, Tag
} from 'antd';
import {
    CreditCardOutlined, MobileOutlined, BankOutlined,
    CheckCircleOutlined, ClockCircleOutlined, QrcodeOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Step } = Steps;

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // Lấy thông tin booking từ navigation state
    const bookingData = location.state?.bookingData;

    console.log('PaymentPage - Location state:', location.state);
    console.log('PaymentPage - Booking data:', bookingData);

    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
    const [transactionId, setTransactionId] = useState('');

    useEffect(() => {
        if (!bookingData) {
            message.error('Không tìm thấy thông tin đặt sân');
            navigate('/my-bookings');
        }
    }, [bookingData, navigate]);

    // Tạo mã giao dịch
    const generateTransactionId = () => {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    };

    // Xử lý thanh toán
    const handlePayment = async (values) => {
        setLoading(true);
        setCurrentStep(1);

        const txnId = generateTransactionId();
        setTransactionId(txnId);

        try {
            // Tạo booking trong database với status pending
            const token = localStorage.getItem('token');
            const bookingResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...bookingData,
                    payment_method: paymentMethod,
                    transaction_id: txnId,
                    status: 'pending_payment'
                })
            });

            if (!bookingResponse.ok) {
                throw new Error('Không thể tạo booking');
            }

            const booking = await bookingResponse.json();

            // Xử lý thanh toán theo phương thức
            if (paymentMethod === 'bank') {
                handleBankPayment(txnId, booking.id);
            } else if (paymentMethod === 'momo') {
                handleMomoPayment(txnId, booking.id);
            }

        } catch (error) {
            console.error('Payment error:', error);
            message.error('Có lỗi xảy ra khi xử lý thanh toán');
            setLoading(false);
            setCurrentStep(0);
        }
    };

    // Thanh toán ngân hàng
    const handleBankPayment = (txnId, bookingId) => {
        setQrModalVisible(true);
        setPaymentStatus('processing');

        // Simulate payment checking
        setTimeout(() => {
            checkPaymentStatus(txnId, bookingId);
        }, 3000);
    };

    // Thanh toán MoMo
    const handleMomoPayment = async (txnId, bookingId) => {
        try {
            setPaymentStatus('processing');
            setQrModalVisible(true);

            // Call MoMo API
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/momo/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: bookingData.total_price,
                    orderInfo: `${bookingData.facility} - ${bookingData.court_name} - ${bookingData.booking_date} ${bookingData.time_slots.join(',')}`,
                    transactionId: txnId,
                    bookingId: bookingId,
                    facilityId: bookingData.facility_id,
                    sportType: bookingData.sport_type,
                    courtId: bookingData.court_id,
                    startTime: bookingData.start_time,
                    endTime: bookingData.end_time
                })
            });

            const result = await response.json();
            if (result.success && result.qrCodeUrl) {
                // Hiển thị QR code MoMo
                // Check payment status periodically
                const checkInterval = setInterval(() => {
                    checkMomoPaymentStatus(txnId, bookingId, checkInterval);
                }, 3000);
            } else {
                throw new Error(result.message || 'Không thể tạo thanh toán MoMo');
            }
        } catch (error) {
            console.error('MoMo payment error:', error);
            message.error('Lỗi khi tạo thanh toán MoMo');
            setLoading(false);
            setCurrentStep(0);
        }
    };



    // Kiểm tra trạng thái thanh toán
    const checkPaymentStatus = async (txnId, bookingId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/status/${txnId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.status === 'success') {
                setPaymentStatus('success');
                setCurrentStep(2);
                message.success('Thanh toán thành công!');

                // Cập nhật trạng thái booking
                await updateBookingStatus(bookingId, 'confirmed');

                setTimeout(() => {
                    navigate('/my-bookings');
                }, 3000);
            } else if (result.status === 'failed') {
                setPaymentStatus('failed');
                message.error('Thanh toán thất bại');
            } else {
                // Tiếp tục kiểm tra
                setTimeout(() => {
                    checkPaymentStatus(txnId, bookingId);
                }, 3000);
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }

        setLoading(false);
        setQrModalVisible(false);
    };

    // Kiểm tra trạng thái thanh toán MoMo
    const checkMomoPaymentStatus = async (txnId, bookingId, interval) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payment/momo/status/${txnId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const result = await response.json();

            if (result.status === 'success') {
                clearInterval(interval);
                setPaymentStatus('success');
                setCurrentStep(2);
                message.success('Thanh toán MoMo thành công!');
                await updateBookingStatus(bookingId, 'confirmed');
                setTimeout(() => navigate('/my-bookings'), 3000);
            } else if (result.status === 'failed') {
                clearInterval(interval);
                setPaymentStatus('failed');
                message.error('Thanh toán MoMo thất bại');
            }
        } catch (error) {
            console.error('Error checking MoMo payment status:', error);
        }
    };

    // Cập nhật trạng thái booking
    const updateBookingStatus = async (bookingId, status) => {
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status, payment_status: 'paid' })
            });
        } catch (error) {
            console.error('Error updating booking status:', error);
        }
    };

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (!bookingData) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2}>Thanh toán đặt sân</Title>

            {/* Steps */}
            <Steps current={currentStep} style={{ marginBottom: 32 }}>
                <Step title="Chọn phương thức" icon={<CreditCardOutlined />} />
                <Step title="Thanh toán" icon={<ClockCircleOutlined />} />
                <Step title="Hoàn thành" icon={<CheckCircleOutlined />} />
            </Steps>

            <Row gutter={24}>
                {/* Thông tin đặt sân */}
                <Col xs={24} lg={8}>
                    <Card title="Thông tin đặt sân" style={{ marginBottom: 24 }}>
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <div>
                                <Text strong>Sân:</Text>
                                <br />
                                <Text>{bookingData.facility}</Text>
                            </div>
                            <div>
                                <Text strong>Thời gian:</Text>
                                <br />
                                <Text>
                                    {dayjs(bookingData.start_time).format('DD/MM/YYYY HH:mm')} -
                                    {dayjs(bookingData.end_time).format('HH:mm')}
                                </Text>
                            </div>
                            <div>
                                <Text strong>Địa điểm:</Text>
                                <br />
                                <Text>{bookingData.location}</Text>
                            </div>
                            <Divider />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text strong>Tổng tiền:</Text>
                                <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>
                                    {formatPrice(bookingData.total_price)}
                                </Text>
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* Form thanh toán */}
                <Col xs={24} lg={16}>
                    <Card title="Phương thức thanh toán">
                        <Form form={form} onFinish={handlePayment} layout="vertical">
                            <Form.Item name="paymentMethod">
                                <Radio.Group
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    style={{ width: '100%' }}
                                >
                                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                        <Radio value="bank">
                                            <Card size="small" style={{ width: '100%', marginLeft: 8 }}>
                                                <Space>
                                                    <BankOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                                                    <div>
                                                        <Text strong>Chuyển khoản ngân hàng</Text>
                                                        <br />
                                                        <Text type="secondary">MB Bank - 0389876420 - NGUYEN VAN A</Text>
                                                    </div>
                                                </Space>
                                            </Card>
                                        </Radio>

                                        <Radio value="momo">
                                            <Card size="small" style={{ width: '100%', marginLeft: 8 }}>
                                                <Space>
                                                    <MobileOutlined style={{ fontSize: 24, color: '#d91465' }} />
                                                    <div>
                                                        <Text strong>Ví MoMo</Text>
                                                        <br />
                                                        <Text type="secondary">Thanh toán qua ví điện tử MoMo</Text>
                                                    </div>
                                                </Space>
                                            </Card>
                                        </Radio>
                                    </Space>
                                </Radio.Group>
                            </Form.Item>

                            {/* Thông tin thanh toán bổ sung */}
                            {paymentMethod === 'bank' && (
                                <Alert
                                    message="Thông tin chuyển khoản"
                                    description={
                                        <div>
                                            <p><strong>Ngân hàng:</strong> MB Bank</p>
                                            <p><strong>Số tài khoản:</strong> 0389876420</p>
                                            <p><strong>Chủ tài khoản:</strong> NGUYEN VAN A</p>
                                            <p><strong>Nội dung:</strong> {transactionId ? `${transactionId} ${bookingData.facility} ${bookingData.court_name}` : 'Mã giao dịch sẽ hiển thị sau khi bấm thanh toán'}</p>
                                        </div>
                                    }
                                    type="info"
                                    style={{ marginBottom: 16 }}
                                />
                            )}

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={loading}
                                    disabled={currentStep !== 0}
                                    style={{ width: '100%' }}
                                >
                                    {loading ? 'Đang xử lý...' : `Thanh toán ${formatPrice(bookingData.total_price)}`}
                                </Button>
                            </Form.Item>
                        </Form>

                        {/* Trạng thái thanh toán */}
                        {paymentStatus === 'processing' && (
                            <Alert
                                message="Đang xử lý thanh toán"
                                description="Vui lòng thực hiện thanh toán và chờ xác nhận..."
                                type="warning"
                                showIcon
                            />
                        )}

                        {paymentStatus === 'success' && (
                            <Alert
                                message="Thanh toán thành công!"
                                description="Đặt sân của bạn đã được xác nhận. Đang chuyển về trang quản lý..."
                                type="success"
                                showIcon
                            />
                        )}

                        {paymentStatus === 'failed' && (
                            <Alert
                                message="Thanh toán thất bại"
                                description="Vui lòng thử lại hoặc chọn phương thức thanh toán khác."
                                type="error"
                                showIcon
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Modal QR Code cho chuyển khoản */}
            <Modal
                title="Quét mã QR để chuyển khoản"
                open={qrModalVisible}
                onCancel={() => setQrModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setQrModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={400}
            >
                <div style={{ textAlign: 'center' }}>
                    <QRCode
                        value={`${transactionId}|${bookingData.facility}|${bookingData.sport_type}|${bookingData.court_id}|${bookingData.booking_date}|${bookingData.time_slots.join(',')}|${bookingData.total_price}`}
                        size={200}
                        style={{ marginBottom: 16 }}
                    />
                    <div>
                        <Text strong>Thông tin chuyển khoản:</Text>
                        <br />
                        <Text>Ngân hàng: MB Bank</Text>
                        <br />
                        <Text>STK: 0389876420</Text>
                        <br />
                        <Text>Số tiền: {formatPrice(bookingData.total_price)}</Text>
                        <br />
                        <Text>Nội dung: {transactionId} {bookingData.facility} {bookingData.court_name}</Text>
                    </div>
                    <Divider />
                    <Spin spinning={loading}>
                        <Text type="secondary">
                            Đang chờ xác nhận thanh toán...
                        </Text>
                    </Spin>
                </div>
            </Modal>
        </div>
    );
};

export default PaymentPage;