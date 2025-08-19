import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Space,
    Divider,
    message,
    Checkbox,
    Row,
    Col
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    GoogleOutlined,
    FacebookOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Link } = Typography;

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: values.username,
                    password: values.password
                })
            });

            if (!res.ok) {
                throw new Error("Sai tài khoản hoặc mật khẩu");
            }

            const data = await res.json();

            message.success("Đăng nhập thành công!");

            // Lưu token + role
            localStorage.setItem("token", data.access_token);
            login(data.user.role);

            // Navigate theo role
            if (data.user.role === "admin") {
                navigate("/admin");
            } else if (data.user.role === "staff") {
                navigate("/staff");
            } else {
                navigate("/");
            }

        } catch (err) {
            message.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        message.info(`Đăng nhập bằng ${provider} (Tính năng đang phát triển)`);
    };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleForgotClick = () => {
        navigate('/forgot');
    }

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
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏸</div>
                        <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
                            Sports Facility
                        </Title>
                        <Title level={3} style={{ color: 'white', fontWeight: 'normal', marginBottom: '24px' }}>
                            Hệ thống đặt sân thể thao hiện đại
                        </Title>
                        <Text style={{ color: 'white', fontSize: '16px' }}>
                            Đặt sân dễ dàng • Thanh toán nhanh chóng • Trải nghiệm tuyệt vời
                        </Text>
                    </div>
                </Col>

                <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <Title level={2} style={{ marginBottom: '8px' }}>
                                Đăng nhập
                            </Title>
                            <Text type="secondary">
                                Chào mừng bạn quay trở lại!
                            </Text>
                        </div>

                        <Form
                            name="login"
                            onFinish={handleSubmit}
                            layout="vertical"
                            size="large"
                        >
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Nhập tên đăng nhập" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />
                            </Form.Item>

                            <Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                                    <Link onClick={handleForgotClick}>Quên mật khẩu?</Link>
                                </div>
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={loading}>
                                    Đăng nhập
                                </Button>
                            </Form.Item>
                        </Form>

                        <Divider>Hoặc</Divider>

                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Button
                                block
                                icon={<GoogleOutlined />}
                                onClick={() => handleSocialLogin('Google')}
                                style={{ borderColor: '#db4437', color: '#db4437' }}
                            >
                                Đăng nhập bằng Google
                            </Button>
                            <Button
                                block
                                icon={<FacebookOutlined />}
                                onClick={() => handleSocialLogin('Facebook')}
                                style={{ borderColor: '#4267B2', color: '#4267B2' }}
                            >
                                Đăng nhập bằng Facebook
                            </Button>
                        </Space>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <Text>
                                Chưa có tài khoản? 
                                <Link onClick={handleRegisterClick}>
                                    Đăng ký ngay
                                </Link>
                            </Text>
                        </div>

                        {/* Demo accounts */}
                        <div style={{ marginTop: '24px', padding: '16px', background: '#f6f6f6', borderRadius: '8px' }}>
                            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                🎯 Tài khoản demo:
                            </Text>
                            <Text style={{ fontSize: '12px', display: 'block' }}>
                                Admin: admin / admin123
                            </Text>
                            <Text style={{ fontSize: '12px', display: 'block' }}>
                                Staff: staff / staff123
                            </Text>
                            <Text style={{ fontSize: '12px', display: 'block' }}>
                                User: user1 / user123
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default LoginPage;