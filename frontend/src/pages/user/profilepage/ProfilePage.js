// Trang thông tin cá nhân người dùng
// - Hiển thị và chỉnh sửa thông tin cá nhân
// - Đổi mật khẩu
// - Thống kê lượt đặt, chi tiêu, môn yêu thích
// - Cài đặt thông báo
// - Upload avatar
// - Gửi yêu cầu nâng cấp lên role host

// Import các thư viện và component cần thiết
import React, { useState, useEffect } from 'react';
import {
    handleUpdateProfile,
    handleChangePassword,
    handleAvatarUpload,
    handleNotificationChange,
    getMemberLevelColor,
    handleHostUpgradeRequest
} from './profileLogic';
import {
    Row, Col, Card, Form, Input, Button, Avatar, Typography, Space, Divider, Upload, Tabs, Statistic, Tag, Switch,
    Modal, Alert, message, Checkbox, Collapse
} from 'antd';
import {
    UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, CameraOutlined,
    EditOutlined, SaveOutlined, LockOutlined, BellOutlined, CalendarOutlined,
    DollarOutlined, TrophyOutlined, CrownOutlined, SendOutlined, UploadOutlined, FileImageOutlined
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;


const ProfilePage = () => {
    // Khởi tạo form cho thông tin cá nhân và đổi mật khẩu
    // State quản lý trạng thái chỉnh sửa, loading
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [upgradeForm] = Form.useForm();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    
    // State cho modal yêu cầu nâng cấp
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    
    // State cho upload files
    const [uploadedFiles, setUploadedFiles] = useState({
        cccd_front: [],
        cccd_back: [],
        business_license: [],
        facility_images: []
    });

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("http://localhost:8000/api/auth/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const user = await res.json();
                setUserInfo(user);
                console.log("User info:", user);
            } else {
                console.error("Token không hợp lệ");
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        if (userInfo) {
            form.setFieldsValue(userInfo);
        }
    }, [userInfo, form]);

    // State quản lý cài đặt thông báo
    const [notifications, setNotifications] = useState({
        email_booking: true,
        sms_booking: false,
        email_promotion: true,
        push_notification: true
    });

    // Mảng thống kê cho user (tổng lượt đặt, chi tiêu, môn yêu thích)
    const stats = [
        {
            title: 'Tổng lượt đặt',
            value: userInfo?.total_bookings,
            prefix: <CalendarOutlined style={{ color: '#1890ff' }} />
        },
        {
            title: 'Tổng chi tiêu',
            value: userInfo?.total_spent,
            prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
            formatter: (value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(value)
        },
        {
            title: 'Môn yêu thích',
            value: userInfo?.favorite_sport,
            prefix: <TrophyOutlined style={{ color: '#faad14' }} />
        }
    ];

    // Xử lý upload files
    const handleFileUpload = (fileType, info) => {
        const { fileList } = info;
        setUploadedFiles(prev => ({
            ...prev,
            [fileType]: fileList
        }));
    };

    // Props cho Upload component
const uploadProps = (fileType, maxCount = 1) => ({
  beforeUpload: (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được upload file ảnh!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }
    return false; // Prevent auto upload
  },
  onChange: (info) => handleFileUpload(fileType, info),
  fileList: uploadedFiles[fileType],
  maxCount,
  listType: 'picture-card',
  accept: 'image/*',
  multiple: true   // 👈 Cho phép chọn nhiều ảnh cùng lúc
});


    // Xử lý gửi yêu cầu nâng cấp host
    const handleUpgradeSubmit = async (values) => {
        setUpgradeLoading(true);
        try {
            // Kiểm tra các file bắt buộc đã upload chưa
            if (uploadedFiles.cccd_front.length === 0) {
                message.error("Vui lòng upload ảnh CCCD mặt trước");
                setUpgradeLoading(false);
                return;
            }
            if (uploadedFiles.cccd_back.length === 0) {
                message.error("Vui lòng upload ảnh CCCD mặt sau");
                setUpgradeLoading(false);
                return;
            }
            if (uploadedFiles.business_license.length === 0) {
                message.error("Vui lòng upload giấy phép kinh doanh");
                setUpgradeLoading(false);
                return;
            }
            if (uploadedFiles.facility_images.length === 0) {
                message.error("Vui lòng upload ít nhất 1 ảnh sân");
                setUpgradeLoading(false);
                return;
            }

            const formData = new FormData();
            
            // Append form values
            Object.keys(values).forEach(key => {
                if (key !== 'agree_terms') {
                    formData.append(key, values[key]);
                }
            });

            // Append files
            uploadedFiles.cccd_front.forEach(file => {
                formData.append('cccd_front', file.originFileObj);
            });
            uploadedFiles.cccd_back.forEach(file => {
                formData.append('cccd_back', file.originFileObj);
            });
            uploadedFiles.business_license.forEach(file => {
                formData.append('business_license', file.originFileObj);
            });
            uploadedFiles.facility_images.forEach(file => {
                formData.append('facility_images', file.originFileObj);
            });

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/auth/request-host-upgrade", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                message.success("Yêu cầu nâng cấp đã được gửi thành công!");
                setUpgradeModalVisible(false);
                upgradeForm.resetFields();
                setUploadedFiles({
                    cccd_front: [],
                    cccd_back: [],
                    business_license: [],
                    facility_images: []
                });
                
                // Cập nhật thông tin user để hiển thị trạng thái pending
                const updatedUser = { ...userInfo, upgrade_request_status: 'pending' };
                setUserInfo(updatedUser);
            } else {
                const error = await response.json();
                message.error(error.detail || "Có lỗi xảy ra khi gửi yêu cầu");
            }
        } catch (error) {
            message.error("Có lỗi xảy ra khi gửi yêu cầu");
        } finally {
            setUpgradeLoading(false);
        }
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
                                    src={userInfo?.avatar}
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
                                {userInfo?.full_name}
                            </Title>

                            <Space direction="vertical" align="center">
                                <Space>
                                    <Tag color="blue">{userInfo?.role === 'user' ? 'Khách hàng' : userInfo?.role}</Tag>
                                    <Tag color={getMemberLevelColor(userInfo?.member_level)}>
                                        {userInfo?.member_level}
                                    </Tag>
                                </Space>

                                {/* Hiển thị trạng thái yêu cầu nâng cấp nếu có */}
                                {userInfo?.upgrade_request_status && (
                                    <Tag color={
                                        userInfo.upgrade_request_status === 'pending' ? 'orange' :
                                        userInfo.upgrade_request_status === 'approved' ? 'green' : 'red'
                                    }>
                                        {userInfo.upgrade_request_status === 'pending' ? 'Đang chờ duyệt Host' :
                                         userInfo.upgrade_request_status === 'approved' ? 'Đã duyệt Host' : 'Từ chối nâng cấp'}
                                    </Tag>
                                )}

                                {/* Button nâng cấp lên host chỉ hiển thị với user và chưa có yêu cầu pending */}
                                {userInfo?.role === 'user' && !userInfo?.upgrade_request_status && (
                                    <Button
                                        type="primary"
                                        icon={<CrownOutlined />}
                                        onClick={() => setUpgradeModalVisible(true)}
                                        style={{ marginTop: 8 }}
                                    >
                                        Đăng ký làm Host
                                    </Button>
                                )}
                            </Space>

                            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
                                Thành viên từ {new Date(userInfo?.created_at).getFullYear()}
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
                                    onFinish={(values) => handleUpdateProfile(values, setLoading, setUserInfo, setEditing)}
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
                                    onFinish={(values) => handleChangePassword(values, setLoading, passwordForm)}
                                    style={{ maxWidth: 400 }}
                                >
                                    <Form.Item
                                        name="old_password"
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
                                                    onChange={(checked) => handleNotificationChange('email_booking', checked, setNotifications)}
                                                />
                                                <Text>Gửi email xác nhận đặt sân</Text>
                                            </Space>
                                        </div>

                                        <div style={{ marginBottom: 12 }}>
                                            <Space>
                                                <Switch
                                                    checked={notifications.sms_booking}
                                                    onChange={(checked) => handleNotificationChange('sms_booking', checked, setNotifications)}
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
                                                    onChange={(checked) => handleNotificationChange('email_promotion', checked, setNotifications)}
                                                />
                                                <Text>Nhận email khuyến mãi</Text>
                                            </Space>
                                        </div>

                                        <div style={{ marginBottom: 12 }}>
                                            <Space>
                                                <Switch
                                                    checked={notifications.push_notification}
                                                    onChange={(checked) => handleNotificationChange('push_notification', checked, setNotifications)}
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

            {/* Modal yêu cầu nâng cấp lên Host */}
            <Modal
                title={
                    <Space>
                        <CrownOutlined style={{ color: '#faad14' }} />
                        <span>Đăng ký làm Host</span>
                    </Space>
                }
                open={upgradeModalVisible}
                onCancel={() => {
                    setUpgradeModalVisible(false);
                    upgradeForm.resetFields();
                    setUploadedFiles({
                        cccd_front: [],
                        cccd_back: [],
                        business_license: [],
                        facility_images: []
                    });
                }}
                footer={null}
                width={600}
            >
                <Alert
                    message="Lưu ý"
                    description="Để trở thành Host, bạn cần cung cấp thông tin chi tiết về kinh nghiệm và lý do muốn trở thành chủ sân. Admin sẽ xem xét và phê duyệt yêu cầu của bạn."
                    type="info"
                    style={{ marginBottom: 16 }}
                />

                <Form
                    form={upgradeForm}
                    layout="vertical"
                    onFinish={handleUpgradeSubmit}
                >
                    <Form.Item
                        name="business_name"
                        label="Tên doanh nghiệp/Cơ sở"
                        rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
                    >
                        <Input placeholder="Ví dụ: Sân thể thao ABC" />
                    </Form.Item>

                    <Form.Item
                        name="business_address"
                        label="Địa chỉ kinh doanh"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ kinh doanh' }]}
                    >
                        <Input placeholder="Địa chỉ đầy đủ của sân thể thao" />
                    </Form.Item>

                    <Form.Item
                        name="experience"
                        label="Kinh nghiệm trong lĩnh vực thể thao"
                        rules={[{ required: true, message: 'Vui lòng mô tả kinh nghiệm của bạn' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Mô tả kinh nghiệm làm việc trong lĩnh vực thể thao, quản lý sân..."
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label="Lý do muốn trở thành Host"
                        rules={[{ required: true, message: 'Vui lòng cho biết lý do' }]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Tại sao bạn muốn trở thành Host trên nền tảng của chúng tôi?"
                        />
                    </Form.Item>

                    <Form.Item
                        name="facilities_description"
                        label="Mô tả về cơ sở vật chất"
                        rules={[{ required: true, message: 'Vui lòng mô tả cơ sở vật chất' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Số lượng sân, loại sân, tiện ích kèm theo..."
                        />
                    </Form.Item>

                    <Divider />

                    <Title level={5}>Giấy tờ cần thiết</Title>
                    
                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="CCCD/CMND mặt trước"
                                required
                            >
                                <Upload {...uploadProps('cccd_front', 1)}>
                                    {uploadedFiles.cccd_front.length < 1 && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Tải lên CCCD mặt trước</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                        
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="CCCD/CMND mặt sau"
                                required
                            >
                                <Upload {...uploadProps('cccd_back', 1)}>
                                    {uploadedFiles.cccd_back.length < 1 && (
                                        <div>
                                            <UploadOutlined />
                                            <div style={{ marginTop: 8 }}>Tải lên CCCD mặt sau</div>
                                        </div>
                                    )}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Giấy phép kinh doanh"
                        required
                    >
                        <Upload {...uploadProps('business_license', 1)}>
                            {uploadedFiles.business_license.length < 1 && (
                                <div>
                                    <FileImageOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên giấy phép kinh doanh</div>
                                </div>
                            )}
                        </Upload>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Giấy chứng nhận đăng ký kinh doanh hoặc giấy phép hoạt động
                        </Text>
                    </Form.Item>

                    <Divider />

                    <Title level={5}>Hình ảnh sân thể thao</Title>
                    <Form.Item
                        label="Ảnh sân và cơ sở vật chất"
                        extra="Tối đa 10 ảnh. Ảnh rõ nét, thể hiện đầy đủ sân và các tiện ích"
                        required
                    >
                        <Upload {...uploadProps('facility_images', 10)}>
                            {uploadedFiles.facility_images.length < 10 && (
                                <div>
                                    <CameraOutlined />
                                    <div style={{ marginTop: 8 }}>Tải lên ảnh sân</div>
                                </div>
                            )}
                        </Upload>
                    </Form.Item>

                    <Divider />

                    {/* <div style={{ marginBottom: 16 }}>
                        <Title level={5}>Điều khoản và Điều kiện Host</Title>
                        <div style={{ 
                            maxHeight: '200px', 
                            overflowY: 'auto', 
                            border: '1px solid #d9d9d9',
                            borderRadius: '6px',
                            padding: '12px',
                            backgroundColor: '#fafafa',
                            marginBottom: '16px'
                        }}>
                            <Text>
                                <strong>ĐIỀU KHOẢN VÀ ĐIỀU KIỆN DÀNH CHO HOST</strong>
                                <br /><br />
                                
                                <strong>1. Trách nhiệm của Host:</strong>
                                <br />
                                - Cung cấp thông tin chính xác về sân thể thao và các dịch vụ
                                <br />
                                - Đảm bảo chất lượng sân đạt tiêu chuẩn an toàn
                                <br />
                                - Phản hồi và xử lý booking một cách kịp thời
                                <br />
                                - Tuân thủ các quy định về giá cả và chính sách hủy
                                <br /><br />
                                
                                <strong>2. Quyền lợi của Host:</strong>
                                <br />
                                - Nhận được hoa hồng từ mỗi booking thành công
                                <br />
                                - Được hỗ trợ marketing và quảng bá từ nền tảng
                                <br />
                                - Truy cập vào công cụ quản lý booking và thống kê
                                <br /><br />
                                
                                <strong>3. Chính sách hoa hồng:</strong>
                                <br />
                                - Nền tảng thu 15% phí dịch vụ từ mỗi booking
                                <br />
                                - Host nhận 85% giá trị booking sau khi trừ phí
                                <br />
                                - Thanh toán hoa hồng hàng tháng vào ngày 5
                                <br /><br />
                                
                                <strong>4. Chính sách vi phạm:</strong>
                                <br />
                                - Vi phạm 3 lần có thể bị đình chỉ tài khoản Host
                                <br />
                                - Cung cấp thông tin sai lệch có thể bị khóa vĩnh viễn
                                <br />
                                - Host có quyền khiếu nại và được xem xét công bằng
                                <br /><br />
                                
                                <strong>5. Điều khoản chung:</strong>
                                <br />
                                - Host phải tuân thủ pháp luật Việt Nam
                                <br />
                                - Mọi tranh chấp sẽ được giải quyết thông qua thương lượng
                                <br />
                                - Nền tảng có quyền cập nhật điều khoản với thông báo trước 30 ngày
                                <br />
                                - Bằng việc đăng ký, Host đồng ý với tất cả điều khoản trên
                            </Text>
                        </div>
                    </div> */}

                    <Collapse accordion>
  <Panel header="1. Trách nhiệm của Host" key="1">
    <Text>
      - Cung cấp thông tin chính xác về sân thể thao và các dịch vụ <br/>
      - Đảm bảo chất lượng sân đạt tiêu chuẩn an toàn <br/>
      - Phản hồi và xử lý booking một cách kịp thời <br/>
      - Tuân thủ các quy định về giá cả và chính sách hủy
    </Text>
  </Panel>
  <Panel header="2. Quyền lợi của Host" key="2">
    <Text>
      - Nhận được hoa hồng từ mỗi booking thành công <br/>
      - Được hỗ trợ marketing và quảng bá từ nền tảng <br/>
      - Truy cập vào công cụ quản lý booking và thống kê
    </Text>
  </Panel>
  <Panel header="3. Chính sách hoa hồng" key="3">
    <Text>
      - Nền tảng thu 15% phí dịch vụ từ mỗi booking <br/>
      - Host nhận 85% giá trị booking sau khi trừ phí <br/>
      - Thanh toán hoa hồng hàng tháng vào ngày 5
    </Text>
  </Panel>
  <Panel header="4. Chính sách vi phạm" key="4">
    <Text>
      - Vi phạm 3 lần có thể bị đình chỉ tài khoản Host <br/>
      - Cung cấp thông tin sai lệch có thể bị khóa vĩnh viễn <br/>
      - Host có quyền khiếu nại và được xem xét công bằng
    </Text>
  </Panel>
  <Panel header="5. Điều khoản chung" key="5">
    <Text>
      - Host phải tuân thủ pháp luật Việt Nam <br/>
      - Mọi tranh chấp sẽ được giải quyết thông qua thương lượng <br/>
      - Nền tảng có quyền cập nhật điều khoản với thông báo trước 30 ngày <br/>
      - Bằng việc đăng ký, Host đồng ý với tất cả điều khoản trên
    </Text>
  </Panel>
</Collapse>

                    <Form.Item
                        name="agree_terms"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với điều khoản để tiếp tục')),
                            },
                        ]}
                    >
                        <Checkbox>
                            Tôi đã đọc và đồng ý với <strong>Điều khoản và Điều kiện dành cho Host</strong>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                        <Space>
                            <Button
                                onClick={() => {
                                    setUpgradeModalVisible(false);
                                    upgradeForm.resetFields();
                                    setUploadedFiles({
                                        cccd_front: [],
                                        cccd_back: [],
                                        business_license: [],
                                        facility_images: []
                                    });
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={upgradeLoading}
                                icon={<SendOutlined />}
                            >
                                Gửi yêu cầu
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;