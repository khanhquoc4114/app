import React, { useState } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Space,
    Checkbox,
    message
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    GoogleOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const handleRegister = async (values) => {
        setLoading(true);

        try {
            // Gọi API đăng ký
            await authAPI.register({
                username: values.email, // Dùng email làm username
                email: values.email,
                full_name: values.fullName,
                password: values.password
            });

            message.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
            navigate('/login');
        } catch (error) {
            message.error(error.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        message.info(`Đăng ký bằng ${provider} đang được phát triển`);
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
            <Card style={{ width: '100%', maxWidth: 450 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: '48px', marginBottom: 16 }}>🏟️</div>
                    <Title level={2} style={{ margin: 0 }}>
                        Đăng ký
                    </Title>
                    <Text type="secondary">
                        Tạo tài khoản để bắt đầu đặt sân
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleRegister}
                    size="large"
                >
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên' },
                            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Nhập họ và tên"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined />}
                            placeholder="Nhập email của bạn"
                        />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
                        ]}
                    >
                        <Input
                            prefix={<PhoneOutlined />}
                            placeholder="Nhập số điện thoại"
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

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu"
                        />
                    </Form.Item>

                    <Form.Item
                        name="agreement"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản'))
                            },
                        ]}
                    >
                        <Checkbox>
                            Tôi đồng ý với{' '}
                            <Link to="/terms" style={{ color: '#1890ff' }}>
                                Điều khoản sử dụng
                            </Link>
                            {' '}và{' '}
                            <Link to="/privacy" style={{ color: '#1890ff' }}>
                                Chính sách bảo mật
                            </Link>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{ height: 48 }}
                        >
                            Đăng ký
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
                        Đăng ký bằng Google
                    </Button>

                    <Button
                        block
                        icon={<FacebookOutlined />}
                        onClick={() => handleSocialLogin('Facebook')}
                        style={{ height: 48 }}
                    >
                        Đăng ký bằng Facebook
                    </Button>
                </Space>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Text type="secondary">
                        Đã có tài khoản? {' '}
                        <Link to="/login" style={{ color: '#1890ff' }}>
                            Đăng nhập ngay
                        </Link>
                    </Text>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;