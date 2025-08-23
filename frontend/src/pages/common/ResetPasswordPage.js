import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Typography,
    message,
    Row,
    Col,
    Result,
    Progress
} from 'antd';
import {
    LockOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;

const ResetPasswordPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [tokenValid, setTokenValid] = useState(null);
    const [password, setPassword] = useState('');
    const { token } = useParams();
    const navigate = useNavigate();

    const verifyToken = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-reset-token/${token}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                setTokenValid(true);
            } else {
                const error = await res.json();
                setTokenValid(false);
                message.error(error.detail || "Token không hợp lệ hoặc đã hết hạn");
            }
        } catch (err) {
            setTokenValid(false);
            message.error("Có lỗi xảy ra khi xác thực token");
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            verifyToken();
        } else {
            setTokenValid(false);
        }
    }, [token, verifyToken]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    new_password: values.password
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.detail || "Có lỗi xảy ra");
            }

            const result = await res.json();
            setSuccess(true);
            message.success(result.message || "Đổi mật khẩu thành công!");

        } catch (err) {
            message.error(err.message || "Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    const handleBackToForgot = () => {
        navigate('/forgot-password');
    };

    // Tính toán độ mạnh của mật khẩu
    const getPasswordStrength = (password) => {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;
        
        return {
            score,
            checks,
            percentage: (score / 5) * 100,
            level: score < 2 ? 'Yếu' : score < 4 ? 'Trung bình' : 'Mạnh'
        };
    };

    const passwordStrength = getPasswordStrength(password);

    const getProgressColor = () => {
        if (passwordStrength.score < 2) return '#ff4d4f';
        if (passwordStrength.score < 4) return '#faad14';
        return '#52c41a';
    };

    if (tokenValid === null) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                    <Title level={3}>Đang xác thực...</Title>
                </Card>
            </div>
        );
    }

    if (tokenValid === false) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Card style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                    <Result
                        status="error"
                        title="Liên kết không hợp lệ"
                        subTitle="Liên kết đặt lại mật khẩu không hợp lệ, đã hết hạn hoặc đã được sử dụng."
                        extra={[
                            <Button type="primary" key="retry" onClick={handleBackToForgot}>
                                Yêu cầu liên kết mới
                            </Button>,
                            <Button key="login" onClick={handleBackToLogin}>
                                Quay lại đăng nhập
                            </Button>
                        ]}
                    />
                </Card>
            </div>
        );
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
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔑</div>
                        <Title level={1} style={{ color: 'white', marginBottom: '16px' }}>
                            Đặt lại mật khẩu
                        </Title>
                        <Title level={3} style={{ color: 'white', fontWeight: 'normal', marginBottom: '24px' }}>
                            Tạo mật khẩu mới và bảo mật
                        </Title>
                        <Text style={{ color: 'white', fontSize: '16px' }}>
                            Chọn mật khẩu mạnh • Xác nhận lại • Hoàn tất đổi mật khẩu
                        </Text>
                    </div>
                </Col>

                <Col xs={24} lg={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Card style={{ 
                        width: '100%', 
                        maxWidth: '450px', 
                        borderRadius: '12px', 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
                    }}>
                        {!success ? (
                            <>
                                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                    <Title level={2} style={{ marginBottom: '8px' }}>
                                        Đặt mật khẩu mới
                                    </Title>
                                    <Text type="secondary">
                                        Nhập mật khẩu mới cho tài khoản của bạn
                                    </Text>
                                </div>

                                <Form
                                    form={form}
                                    name="reset_password"
                                    onFinish={handleSubmit}
                                    layout="vertical"
                                    size="large"
                                >
                                    <Form.Item
                                        name="password"
                                        label="Mật khẩu mới"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                                            {
                                                validator: (_, value) => {
                                                    const strength = getPasswordStrength(value || '');
                                                    if (value && strength.score < 3) {
                                                        return Promise.reject('Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn!');
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Nhập mật khẩu mới"
                                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </Form.Item>

                                    {password && (
                                        <div style={{ marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <Text strong>Độ mạnh mật khẩu:</Text>
                                                <Text style={{ color: getProgressColor() }}>{passwordStrength.level}</Text>
                                            </div>
                                            <Progress 
                                                percent={passwordStrength.percentage} 
                                                strokeColor={getProgressColor()}
                                                showInfo={false}
                                                style={{ marginBottom: '12px' }}
                                            />
                                            <div style={{ fontSize: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                    {passwordStrength.checks.length ? 
                                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} /> : 
                                                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
                                                    }
                                                    <Text>Ít nhất 8 ký tự</Text>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                    {passwordStrength.checks.uppercase ? 
                                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} /> : 
                                                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
                                                    }
                                                    <Text>Chữ hoa (A-Z)</Text>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                    {passwordStrength.checks.lowercase ? 
                                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} /> : 
                                                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
                                                    }
                                                    <Text>Chữ thường (a-z)</Text>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                    {passwordStrength.checks.number ? 
                                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} /> : 
                                                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
                                                    }
                                                    <Text>Số (0-9)</Text>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    {passwordStrength.checks.special ? 
                                                        <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '4px' }} /> : 
                                                        <CloseCircleOutlined style={{ color: '#ff4d4f', marginRight: '4px' }} />
                                                    }
                                                    <Text>Ký tự đặc biệt (!@#$%...)</Text>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Form.Item
                                        name="confirmPassword"
                                        label="Xác nhận mật khẩu"
                                        dependencies={['password']}
                                        rules={[
                                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject('Mật khẩu xác nhận không khớp!');
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined />}
                                            placeholder="Nhập lại mật khẩu mới"
                                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        />
                                    </Form.Item>

                                    <Form.Item style={{ marginBottom: '16px' }}>
                                        <Button type="primary" htmlType="submit" block loading={loading}>
                                            Đặt lại mật khẩu
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
                                title="Đổi mật khẩu thành công!"
                                subTitle="Mật khẩu của bạn đã được cập nhật. Bây giờ bạn có thể đăng nhập với mật khẩu mới."
                                extra={
                                    <Button type="primary" onClick={handleBackToLogin}>
                                        Đăng nhập ngay
                                    </Button>
                                }
                            />
                        )}

                        {/* Security Tips */}
                        {!success && (
                            <div style={{ 
                                marginTop: '24px', 
                                padding: '16px', 
                                background: '#f6ffed', 
                                borderRadius: '8px', 
                                border: '1px solid #b7eb8f' 
                            }}>
                                <Text strong style={{ display: 'block', marginBottom: '8px', color: '#52c41a' }}>
                                    🛡️ Bảo mật tài khoản:
                                </Text>
                                <Text style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                    • Không chia sẻ mật khẩu với ai
                                </Text>
                                <Text style={{ fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                    • Sử dụng mật khẩu khác nhau cho các tài khoản
                                </Text>
                                <Text style={{ fontSize: '12px', display: 'block' }}>
                                    • Đăng xuất khi sử dụng máy tính chung
                                </Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ResetPasswordPage;