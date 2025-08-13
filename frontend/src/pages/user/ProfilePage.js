import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Button,
    Avatar,
    Typography,
    Space,
    Divider,
    Upload,
    message,
    Tabs,
    Statistic,
    Tag,
    Switch
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CameraOutlined,
    EditOutlined,
    SaveOutlined,
    LockOutlined,
    BellOutlined,
    CalendarOutlined,
    DollarOutlined,
    TrophyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock user data
    const [userInfo, setUserInfo] = useState({
        id: 1,
        username: 'user1',
        email: 'user1@example.com',
        full_name: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        avatar: null,
        role: 'user',
        created_at: '2024-01-01',
        total_bookings: 15,
        total_spent: 2400000,
        favorite_sport: 'Cầu lông',
        member_level: 'Silver'
    });

    const [notifications, setNotifications] = useState({
        email_booking: true,
        sms_booking: false,
        email_promotion: true,
        push_notification: true
    });

    const stats = [
        {
            title: 'Tổng lượt đặt',
            value: userInfo.total_bookings,
            prefix: <CalendarOutlined style={{ color: '#1890ff' }} />
        },
        {
            title: 'Tổng chi tiêu',
            value: userInfo.total_spent,
            prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
            formatter: (value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(value)
        },
        {
            title: 'Môn yêu thích',
            value: userInfo.favorite_sport,
            prefix: <TrophyOutlined style={{ color: '#faad14' }} />
        }
    ];

    const handleUpdateProfile = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setUserInfo(prev => ({ ...prev, ...values }));
            message.success('Cập nhật thông tin thành công!');
            setEditing(false);
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            message.success('Đổi mật khẩu thành công!');
            passwordForm.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra, vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = (info) => {
        if (info.file.status === 'done') {
            message.success('Cập nhật ảnh đại diện thành công!');
        } else if (info.file.status === 'error') {
            message.error('Tải ảnh thất bại!');
        }
    };

    const handleNotificationChange = (key, value) => {
        setNotifications(prev => ({
            ...prev,
            [key]: value
        }));
        message.success('Cập nhật cài đặt thông báo thành công!');
    };

    const getMemberLevelColor = (level) => {
        const colors = {
            Bronze: '#cd7f32',
            Silver: '#c0c0c0',
            Gold: '#ffd700',
            Platinum: '#e5e4e2'
        };
        return colors[level] || '#1890ff';
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Thông tin cá nhân</Title>
                <Text type="secondary">Quản lý thông tin tài khoản và cài đặt</Text>
            </div>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={8}>
                    <Card>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar
                                    size={120}
                                    icon={<UserOutlined />}
                                    src={userInfo.avatar}
                                    style={{ marginBottom: 16 }}
                                />
                                <Upload
                                    showUploadList={false}
                                    onChange={handleAvatarUpload}
                                    style={{
                                        position: 'absolute',
                                        bottom: 16,
                                        right: 0
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={<CameraOutlined />}
                                        size="small"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0
                                        }}
                                    />
                                </Upload>
                            </div>

                            <Title level={4} style={{ margin: '8px 0' }}>
                                {userInfo.full_name}
                            </Title>

                            <Space>
                                <Tag color="blue">{userInfo.role === 'user' ? 'Khách hàng' : userInfo.role}</Tag>
                                <Tag color={getMemberLevelColor(userInfo.member_level)}>
                                    {userInfo.member_level}
                                </Tag>
                            </Space>

                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                Thành viên từ {new Date(userInfo.created_at).getFullYear()}
                            </Text>
                        </div>

                        <Divider />

                        <Row gutter={[16, 16]}>
                            {stats.map((stat, index) => (
                                <Col span={24} key={index}>
                                    <Statistic
                                        title={stat.title}
                                        value={stat.value}
                                        prefix={stat.prefix}
                                        formatter={stat.formatter}
                                        valueStyle={{ fontSize: '16px' }}
                                    />
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card>
                        <Tabs defaultActiveKey="profile">
                            <TabPane tab="Thông tin cá nhân" key="profile">
                                <div style={{ marginBottom: 16 }}>
                                    <Button
                                        type={editing ? 'default' : 'primary'}
                                        icon={editing ? <SaveOutlined /> : <EditOutlined />}
                                        onClick={() => {
                                            if (editing) {
                                                form.submit();
                                            } else {
                                                setEditing(true);
                                                form.setFieldsValue(userInfo);
                                            }
                                        }}
                                        loading={loading}
                                    >
                                        {editing ? 'Lưu thay đổi' : 'Chỉnh sửa'}
                                    </Button>
                                    {editing && (
                                        <Button
                                            style={{ marginLeft: 8 }}
                                            onClick={() => {
                                                setEditing(false);
                                                form.resetFields();
                                            }}
                                        >
                                            Hủy
                                        </Button>
                                    )}
                                </div>

                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={handleUpdateProfile}
                                    initialValues={userInfo}
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="full_name"
                                                label="Họ và tên"
                                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined />}
                                                    disabled={!editing}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="username"
                                                label="Tên đăng nhập"
                                            >
                                                <Input
                                                    prefix={<UserOutlined />}
                                                    disabled
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
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
                                                    disabled={!editing}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="phone"
                                                label="Số điện thoại"
                                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                            >
                                                <Input
                                                    prefix={<PhoneOutlined />}
                                                    disabled={!editing}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="address"
                                        label="Địa chỉ"
                                    >
                                        <Input
                                            prefix={<EnvironmentOutlined />}
                                            disabled={!editing}
                                        />
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            <TabPane tab="Đổi mật khẩu" key="password">
                                <Form
                                    form={passwordForm}
                                    layout="vertical"
                                    onFinish={handleChangePassword}
                                    style={{ maxWidth: 400 }}
                                >
                                    <Form.Item
                                        name="current_password"
                                        label="Mật khẩu hiện tại"
                                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="new_password"
                                        label="Mật khẩu mới"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirm_password"
                                        label="Xác nhận mật khẩu mới"
                                        dependencies={['new_password']}
                                        rules={[
                                            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('new_password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password prefix={<LockOutlined />} />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading}>
                                            Đổi mật khẩu
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </TabPane>

                            <TabPane tab="Cài đặt thông báo" key="notifications">
                                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                                    <div>
                                        <Title level={5}>
                                            <BellOutlined /> Thông báo đặt sân
                                        </Title>

                                        <div style={{ marginBottom: 12 }}>
                                            <Space>
                                                <Switch
                                                    checked={notifications.email_booking}
                                                    onChange={(checked) => handleNotificationChange('email_booking', checked)}
                                                />
                                                <Text>Gửi email xác nhận đặt sân</Text>
                                            </Space>
                                        </div>

                                        <div style={{ marginBottom: 12 }}>
                                            <Space>
                                                <Switch
                                                    checked={notifications.sms_booking}
                                                    onChange={(checked) => handleNotificationChange('sms_booking', checked)}
                                                />
                                                <Text>Gửi SMS xác nhận đặt sân</Text>
                                            </Space>
                                        </div>
                                    </div>

                                    <Divider />

                                    <div>
                                        <Title level={5}>Thông báo khuyến mãi</Title>

                                        <div style={{ marginBottom: 12 }}>
                                            <Space>
                                                <Switch
                                                    checked={notifications.email_promotion}
                                                    onChange={(checked) => handleNotificationChange('email_promotion', checked)}
                                                />
                                                <Text>Nhận email khuyến mãi</Text>
                                            </Space>
                                        </div>

                                        <div style={{ marginBottom: 12 }}>
                                            <Space>
                                                <Switch
                                                    checked={notifications.push_notification}
                                                    onChange={(checked) => handleNotificationChange('push_notification', checked)}
                                                />
                                                <Text>Thông báo đẩy trên trình duyệt</Text>
                                            </Space>
                                        </div>
                                    </div>
                                </Space>
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProfilePage;