// Trang dashboard quản trị hệ thống
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Space, Tag, Button, Modal, Form, Input, Select, Tabs, DatePicker, Upload, message } from 'antd';
import { DollarOutlined, UserOutlined, ShopOutlined, CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminFacility from './AdminFacility';
import AdminUser from './AdminUser';
import { handleAddFacility, handleEditFacility, handleDeleteFacility, handleToggleUserStatus } from './adminDashboardLogic';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
    const [facilityModalVisible, setFacilityModalVisible] = useState(false);
    const [userModalVisible, setUserModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);

    // Mock data
    const adminStats = [
        {
            title: 'Tổng doanh thu',
            value: 45600000,
            prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
            suffix: 'VNĐ'
        },
        {
            title: 'Tổng người dùng',
            value: 1247,
            prefix: <UserOutlined style={{ color: '#1890ff' }} />
        },
        {
            title: 'Tổng sân',
            value: 28,
            prefix: <ShopOutlined style={{ color: '#722ed1' }} />
        },
        {
            title: 'Đặt sân hôm nay',
            value: 156,
            prefix: <CalendarOutlined style={{ color: '#faad14' }} />
        }
    ];

    // Danh sách sân mẫu
    const facilities = [
        new AdminFacility(1, 'Sân cầu lông VIP 1', 'Cầu lông', 80000, 'active', 45, 3600000, 'Nguyễn Văn A'),
        new AdminFacility(2, 'Sân bóng đá mini A', 'Bóng đá', 200000, 'maintenance', 23, 4600000, 'Trần Thị B')
    ];

    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/users/all");
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                console.error("Lỗi khi fetch users:", err);
            }
        };

        fetchUsers();
    }, []);

    // Mock data
    const revenueData = [
        { date: '2024-01-15', revenue: 1200000, bookings: 8 },
        { date: '2024-01-16', revenue: 1800000, bookings: 12 },
        { date: '2024-01-17', revenue: 2100000, bookings: 15 },
        { date: '2024-01-18', revenue: 1600000, bookings: 10 },
        { date: '2024-01-19', revenue: 2400000, bookings: 18 },
        { date: '2024-01-20', revenue: 1900000, bookings: 13 },
        { date: '2024-01-21', revenue: 2200000, bookings: 16 }
    ];

    const handleAddFacility = () => {
        setSelectedFacility(null);
        setFacilityModalVisible(true);
    };

    const handleEditFacility = (record) => {
        setSelectedFacility(record);
        setFacilityModalVisible(true);
    };

    const handleDeleteFacility = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa sân',
            content: `Bạn có chắc muốn xóa sân "${record.name}"?`,
            onOk: () => {
                message.success(`Đã xóa sân ${record.name}`);
            }
        });
    };

    const handleToggleUserStatus = (record) => {
        const action = record.is_active ? 'khóa' : 'mở khóa';
        message.success(`Đã ${action} tài khoản ${record.username}`);
    };

    const facilityColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60
        },
        {
            title: 'Tên sân',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Môn thể thao',
            dataIndex: 'sport_type',
            key: 'sport_type',
            render: (sport) => <Tag color="blue">{sport}</Tag>
        },
        {
            title: 'Giá/giờ',
            dataIndex: 'price_per_hour',
            key: 'price_per_hour',
            render: (price) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = {
                    active: { color: 'green', text: 'Hoạt động' },
                    maintenance: { color: 'orange', text: 'Bảo trì' },
                    inactive: { color: 'red', text: 'Tạm ngưng' }
                };
                return <Tag color={config[status].color}>{config[status].text}</Tag>;
            }
        },
        {
            title: 'Lượt đặt',
            dataIndex: 'bookings_count',
            key: 'bookings_count'
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(revenue)
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />}>Chi tiết</Button>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEditFacility(record)}>
                        Sửa
                    </Button>
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteFacility(record)}>
                        Xóa
                    </Button>
                </Space>
            )
        }
    ];

    const userColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username'
        },
        {
            title: 'Họ tên',
            dataIndex: 'full_name',
            key: 'full_name'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const config = {
                    admin: { color: 'red', text: 'Admin' },
                    host: { color: 'orange', text: 'Chủ sân' },
                    user: { color: 'blue', text: 'Khách hàng' }
                };
                return <Tag color={config[role].color}>{config[role].text}</Tag>;
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Hoạt động' : 'Bị khóa'}
                </Tag>
            )
        },
        {
            title: 'Tổng đặt',
            dataIndex: 'total_bookings',
            key: 'total_bookings'
        },
        {
            title: 'Tổng chi',
            dataIndex: 'total_spent',
            key: 'total_spent',
            render: (amount) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount)
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={record.is_active ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => handleToggleUserStatus(record)}
                    >
                        {record.is_active ? 'Khóa' : 'Mở'}
                    </Button>
                    <Button size="small" icon={<EditOutlined />}>Sửa</Button>
                </Space>
            )
        }
    ];

    const revenueColumns = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(revenue)
        },
        {
            title: 'Số lượt đặt',
            dataIndex: 'bookings',
            key: 'bookings'
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Quản trị hệ thống</Title>
                <Text type="secondary">Dashboard tổng quan và quản lý</Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {adminStats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card>
                <Tabs defaultActiveKey="facilities">
                    <TabPane tab="Quản lý sân" key="facilities">
                        <div style={{ marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFacility}>
                                Thêm sân mới
                            </Button>
                        </div>
                        <Table
                            columns={facilityColumns}
                            dataSource={facilities}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 1000 }}
                        />
                    </TabPane>

                    <TabPane tab="Quản lý người dùng" key="users">
                        <div style={{ marginBottom: 16 }}>
                            <Button type="primary" icon={<PlusOutlined />}>
                                Thêm chủ sân
                            </Button>
                        </div>
                        <Table
                            columns={userColumns}
                            dataSource={users}
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 1000 }}
                        />
                    </TabPane>

                    <TabPane tab="Báo cáo doanh thu" key="revenue">
                        <div style={{ marginBottom: 16 }}>
                            <Space>
                                <Text strong>Chọn khoảng thời gian:</Text>
                                <RangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    format="DD/MM/YYYY"
                                />
                                <Button type="primary">Xuất báo cáo</Button>
                            </Space>
                        </div>
                        <Table
                            columns={revenueColumns}
                            dataSource={revenueData}
                            pagination={false}
                            summary={(pageData) => {
                                const totalRevenue = pageData.reduce((sum, record) => sum + record.revenue, 0);
                                const totalBookings = pageData.reduce((sum, record) => sum + record.bookings, 0);
                                return (
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell><strong>Tổng cộng</strong></Table.Summary.Cell>
                                        <Table.Summary.Cell>
                                            <strong style={{ color: '#52c41a' }}>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(totalRevenue)}
                                            </strong>
                                        </Table.Summary.Cell>
                                        <Table.Summary.Cell><strong>{totalBookings}</strong></Table.Summary.Cell>
                                    </Table.Summary.Row>
                                );
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Modal thêm/sửa sân */}
            <Modal
                title={selectedFacility ? 'Sửa thông tin sân' : 'Thêm sân mới'}
                open={facilityModalVisible}
                onCancel={() => setFacilityModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form layout="vertical" initialValues={selectedFacility}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Tên sân" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="sport_type" label="Môn thể thao" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="badminton">Cầu lông</Option>
                                    <Option value="football">Bóng đá</Option>
                                    <Option value="tennis">Tennis</Option>
                                    <Option value="basketball">Bóng rổ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="price_per_hour" label="Giá/giờ (VNĐ)" rules={[{ required: true }]}>
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Trạng thái">
                                <Select>
                                    <Option value="active">Hoạt động</Option>
                                    <Option value="maintenance">Bảo trì</Option>
                                    <Option value="inactive">Tạm ngưng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="image" label="Hình ảnh">
                        <Upload>
                            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {selectedFacility ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                            <Button onClick={() => setFacilityModalVisible(false)}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDashboard;