import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    message,
    Row,
    Col,
    Result
} from 'antd';
import {
    MailOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

const ForgotPasswordPage = () => {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Giả lập API call để gửi email reset password
            const res = await fetch("http://localhost:8000/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: values.email
                })
            });

            if (!res.ok) {
                throw new Error("Email không tồn tại trong hệ thống");
            }

            setEmail(values.email);
            setEmailSent(true);
            message.success("Email khôi phục mật khẩu đã được gửi!");

        } catch (err) {
            message.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const handleResendEmail = () => {
        setEmailSent(false);
        message.info('Vui lòng nhập email để gửi lại');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <Row style={{ width: '100%', maxWidth: '1200px' }}>
                <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔐</div>
                        <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
                            Khôi phục mật khẩu
                        </Title>
                        <Title level={3} style={{ color: 'white', fontWeight: 'normal', marginBottom: '24px' }}>
                            Đừng lo lắng, chúng tôi sẽ giúp bạn
                        </Title>
                        <Text style={{ color: 'white', fontSize: '16px' }}>
                            Nhập email của bạn • Kiểm tra hộp thư • Đặt lại mật khẩu mới
                        </Text>
                    </div>
                </Col>

                <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                        {!emailSent ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <Title level={2} style={{ marginBottom: '8px' }}>
                                        Quên mật khẩu?
                                    </Title>
                                    <Text type="secondary">
                                        Nhập email của bạn để nhận liên kết khôi phục mật khẩu
                                    </Text>
                                </div>

                                <Form
                                    name="forgot_password"
                                    onFinish={handleSubmit}
                                    layout="vertical"
                                    size="large"
                                >
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input 
                                            prefix={<MailOutlined />} 
                                            placeholder="Nhập địa chỉ email của bạn"
                                        />
                                    </Form.Item>

                                    <Form.Item style={{ marginBottom: '16px' }}>
                                        <Button type="primary" htmlType="submit" block loading={loading}>
                                            Gửi liên kết khôi phục
                                        </Button>
                                    </Form.Item>
                                </Form>

                                <div style={{ textAlign: 'center' }}>
                                    <Button 
                                        type="link" 
                                        icon={<ArrowLeftOutlined />}
                                        onClick={handleBackToLogin}
                                        style={{ padding: 0 }}
                                    >
                                        Quay lại đăng nhập
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <Result
                                status="success"
                                title="Email đã được gửi!"
                                subTitle={
                                    <div style={{ textAlign: 'left' }}>
                                        <Text>
                                            Chúng tôi đã gửi liên kết khôi phục mật khẩu đến địa chỉ email:
                                        </Text>
                                        <br />
                                        <Text strong style={{ color: '#1890ff' }}>
                                            {email}
                                        </Text>
                                        <br /><br />
                                        <Text type="secondary">
                                            Vui lòng kiểm tra hộp thư của bạn (bao gồm cả thư mục spam) và click vào liên kết để đặt lại mật khẩu.
                                        </Text>
                                    </div>
                                }
                                extra={[
                                    <Button type="primary" key="back" onClick={handleBackToLogin}>
                                        Quay lại đăng nhập
                                    </Button>,
                                    <Button key="resend" onClick={handleResendEmail}>
                                        Gửi lại email
                                    </Button>
                                ]}
                            />
                        )}

                        {/* Helpful tips */}
                        {!emailSent && (
                            <div style={{ marginTop: '24px', padding: '16px', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #d6f1ff' }}>
                                <Text strong style={{ display: 'block', marginBottom: '8px', color: '#1890ff' }}>
                                    💡 Mẹo hữu ích:
                                </Text>
                                <Text style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                    • Kiểm tra cả hộp thư spam/junk
                                </Text>
                                <Text style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                    • Email có thể mất vài phút để đến
                                </Text>
                                <Text style={{ fontSize: '12px', display: 'block' }}>
                                    • Liên kết có hiệu lực trong 15 phút
                                </Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ForgotPasswordPage;