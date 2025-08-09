import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Space,
    message
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    GoogleOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleLogin = async (values) => {
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            message.success('Đăng nhập thành công!');
            setLoading(false);
            navigate('/');
        }, 1500);
    };

    const handleSocialLogin = (provider) => {
        message.info(`Đăng nhập bằng ${provider} đang được phát triển`);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <Card style={{ width: '100%', maxWidth: 400 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: '48px', marginBottom: 16 }}>🏟️</div>
                    <Title level={2} style={{ margin: 0 }}>
                        Đăng nhập
                    </Title>
                    <Text type="secondary">
                        Chào mừng bạn quay trở lại
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleLogin}
                    size="large"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập email của bạn"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link to="/forgot-password" style={{ color: '#1890ff' }}>
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{ height: 48 }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>Hoặc</Divider>

                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <Button
                        block
                        icon={<GoogleOutlined />}
                        onClick={() => handleSocialLogin('Google')}
                        style={{ height: 48 }}
                    >
                        Đăng nhập bằng Google
                    </Button>

                    <Button
                        block
                        icon={<FacebookOutlined />}
                        onClick={() => handleSocialLogin('Facebook')}
                        style={{ height: 48 }}
                    >
                        Đăng nhập bằng Facebook
                    </Button>
                </Space>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Text type="secondary">
                        Chưa có tài khoản? {' '}
                        <Link to="/register" style={{ color: '#1890ff' }}>
                            Đăng ký ngay
                        </Link>
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;