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
    MailOutlined,
    GoogleOutlined,
    FacebookOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Link } = Typography;

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (isLogin) {
                message.success('Đăng nhập thành công!');
                // Mock user role check
                let userRole = 'user';
                if (values.username === 'admin') {
                    userRole = 'admin';
                } else if (values.username === 'staff') {
                    userRole = 'staff';
                }

                login(userRole);

                // Navigate based on role
                if (userRole === 'admin') {
                    navigate('/admin');
                } else if (userRole === 'staff') {
                    navigate('/staff');
                } else {
                    navigate('/');
                }
            } else {
                message.success('Đăng ký thành công! Vui lòng đăng nhập.');
                setIsLogin(true);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        message.info(`Đăng nhập bằng ${provider} (Tính năng đang phát triển)`);
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
                                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                            </Title>
                            <Text type="secondary">
                                {isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản mới'}
                            </Text>
                        </div>

                        <Form
                            name={isLogin ? 'login' : 'register'}
                            onFinish={handleSubmit}
                            layout="vertical"
                            size="large"
                        >
                            {!isLogin && (
                                <>
                                    <Form.Item
                                        name="full_name"
                                        label="Họ và tên"
                                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
                                    </Form.Item>

                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email!' },
                                            { type: 'email', message: 'Email không hợp lệ!' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Nhập email" />
                                    </Form.Item>
                                </>
                            )}

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

                            {!isLogin && (
                                <Form.Item
                                    name="confirm_password"
                                    label="Xác nhận mật khẩu"
                                    dependencies={['password']}
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Xác nhận mật khẩu"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>
                            )}

                            {isLogin && (
                                <Form.Item>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                                        <Link>Quên mật khẩu?</Link>
                                    </div>
                                </Form.Item>
                            )}

                            <Form.Item>
                                <Button type="primary" htmlType="submit" block loading={loading}>
                                    {isLogin ? 'Đăng nhập' : 'Đăng ký'}
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
                                {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
                                <Link onClick={() => setIsLogin(!isLogin)}>
                                    {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
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