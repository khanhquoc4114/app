// Trang dashboard quản trị hệ thống
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Space, Tag, Button, Modal, Form, Input, Select, Tabs, DatePicker, Upload, message, Avatar, Tooltip, Badge } from 'antd';
import { DollarOutlined, UserOutlined, ShopOutlined, CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, LockOutlined, UnlockOutlined, CheckOutlined, CloseOutlined, FileTextOutlined, IdcardOutlined, PhoneOutlined, MailOutlined, BankOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AdminFacility from './AdminFacility';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

const AdminDashboard = () => {
    const [facilityModalVisible, setFacilityModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
    const [roleRequestDetailVisible, setRoleRequestDetailVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

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

    // Mock data cho yêu cầu nâng role
    const [roleRequests, setRoleRequests] = useState([
        {
            id: 1,
            user_id: 123,
            username: 'nguyenvana',
            full_name: 'Nguyễn Văn A',
            email: 'nguyenvana@gmail.com',
            phone: '0987654321',
            current_role: 'user',
            requested_role: 'host',
            status: 'pending',
            request_date: '2024-01-20',
            business_license: 'GPKD123456789',
            business_name: 'Sân thể thao ABC',
            business_address: '123 Đường XYZ, Quận 1, TP.HCM',
            bank_account: '1234567890 - Vietcombank',
            experience: '5 năm kinh nghiệm quản lý sân thể thao',
            reason: 'Tôi muốn mở rộng dịch vụ cho thuê sân thể thao để phục vụ cộng đồng tốt hơn.',
            documents: ['gpkd.pdf', 'cmnd.pdf', 'sao_ke_ngan_hang.pdf']
        },
        {
            id: 2,
            user_id: 124,
            username: 'tranthib',
            full_name: 'Trần Thị B',
            email: 'tranthib@gmail.com',
            phone: '0976543210',
            current_role: 'user',
            requested_role: 'host',
            status: 'pending',
            request_date: '2024-01-19',
            business_license: 'GPKD987654321',
            business_name: 'Trung tâm thể thao DEF',
            business_address: '456 Đường ABC, Quận 2, TP.HCM',
            bank_account: '9876543210 - BIDV',
            experience: '3 năm làm việc trong lĩnh vực thể thao',
            reason: 'Có sẵn cơ sở vật chất và muốn kinh doanh dịch vụ sân thể thao.',
            documents: ['gpkd.pdf', 'cmnd.pdf']
        },
        {
            id: 3,
            user_id: 125,
            username: 'lvanc',
            full_name: 'Lê Văn C',
            email: 'levanc@gmail.com',
            phone: '0965432109',
            current_role: 'user',
            requested_role: 'host',
            status: 'approved',
            request_date: '2024-01-15',
            approved_date: '2024-01-18',
            approved_by: 'Admin System',
            business_license: 'GPKD456789123',
            business_name: 'Câu lạc bộ GHI',
            business_address: '789 Đường DEF, Quận 3, TP.HCM'
        }
    ]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/all`);
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

    // Xử lý yêu cầu nâng role
    const handleApproveRequest = (record) => {
        Modal.confirm({
            title: 'Xác nhận duyệt yêu cầu',
            content: `Bạn có chắc muốn duyệt yêu cầu nâng role của ${record.full_name}?`,
            onOk: () => {
                // Cập nhật trạng thái
                setRoleRequests(prev => prev.map(req => 
                    req.id === record.id 
                        ? { ...req, status: 'approved', approved_date: dayjs().format('YYYY-MM-DD'), approved_by: 'Admin System' }
                        : req
                ));
                message.success(`Đã duyệt yêu cầu của ${record.full_name}`);
            }
        });
    };

    const handleRejectRequest = (record) => {
        Modal.confirm({
            title: 'Xác nhận từ chối yêu cầu',
            content: (
                <div>
                    <p>Bạn có chắc muốn từ chối yêu cầu nâng role của {record.full_name}?</p>
                    <Input.TextArea placeholder="Lý do từ chối (tùy chọn)" rows={3} />
                </div>
            ),
            onOk: () => {
                setRoleRequests(prev => prev.map(req => 
                    req.id === record.id 
                        ? { ...req, status: 'rejected', rejected_date: dayjs().format('YYYY-MM-DD'), rejected_by: 'Admin System' }
                        : req
                ));
                message.success(`Đã từ chối yêu cầu của ${record.full_name}`);
            }
        });
    };

    const handleViewRequestDetail = (record) => {
        setSelectedRequest(record);
        setRoleRequestDetailVisible(true);
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

    const roleRequestColumns = [
        {
            title: 'Thông tin người dùng',
            key: 'user_info',
            width: 250,
            render: (_, record) => (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                        <Avatar style={{ backgroundColor: '#1890ff', marginRight: 8 }}>
                            {record.full_name?.charAt(0)}
                        </Avatar>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{record.full_name}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
                        </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        <div><MailOutlined /> {record.email}</div>
                        <div><PhoneOutlined /> {record.phone}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Thông tin kinh doanh',
            key: 'business_info',
            render: (_, record) => (
                <div style={{ fontSize: '12px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.business_name}</div>
                    <div><IdcardOutlined /> {record.business_license}</div>
                    <div style={{ marginTop: 4 }}>{record.business_address}</div>
                </div>
            )
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'request_date',
            key: 'request_date',
            width: 100,
            render: (date) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const config = {
                    pending: { color: 'orange', text: 'Chờ duyệt' },
                    approved: { color: 'green', text: 'Đã duyệt' },
                    rejected: { color: 'red', text: 'Từ chối' }
                };
                return (
                    <Badge 
                        color={config[status].color} 
                        text={config[status].text}
                    />
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space wrap>
                    <Tooltip title="Xem chi tiết">
                        <Button 
                            size="small" 
                            icon={<EyeOutlined />}
                            onClick={() => handleViewRequestDetail(record)}
                        >
                            Chi tiết
                        </Button>
                    </Tooltip>
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Duyệt yêu cầu">
                                <Button 
                                    size="small" 
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleApproveRequest(record)}
                                >
                                    Duyệt
                                </Button>
                            </Tooltip>
                            <Tooltip title="Từ chối yêu cầu">
                                <Button 
                                    size="small" 
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => handleRejectRequest(record)}
                                >
                                    Từ chối
                                </Button>
                            </Tooltip>
                        </>
                    )}
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

    // Đếm số yêu cầu pending
    const pendingRequestsCount = roleRequests.filter(req => req.status === 'pending').length;

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

                    <TabPane 
                        tab={
                            <Badge count={pendingRequestsCount} offset={[10, 0]}>
                                Yêu cầu nâng role
                            </Badge>
                        } 
                        key="role-requests"
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Space>
                                <Text strong>Bộ lọc:</Text>
                                <Select defaultValue="all" style={{ width: 120 }}>
                                    <Option value="all">Tất cả</Option>
                                    <Option value="pending">Chờ duyệt</Option>
                                    <Option value="approved">Đã duyệt</Option>
                                    <Option value="rejected">Từ chối</Option>
                                </Select>
                                <Button>Làm mới</Button>
                            </Space>
                        </div>
                        <Table
                            columns={roleRequestColumns}
                            dataSource={roleRequests}
                            pagination={{ 
                                pageSize: 10,
                                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`
                            }}
                            scroll={{ x: 1200 }}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <div style={{ marginBottom: 16 }}>
                                                    <Text strong>Kinh nghiệm:</Text>
                                                    <Paragraph style={{ marginTop: 8 }}>
                                                        {record.experience}
                                                    </Paragraph>
                                                </div>
                                                <div>
                                                    <Text strong>Lý do yêu cầu:</Text>
                                                    <Paragraph style={{ marginTop: 8 }}>
                                                        {record.reason}
                                                    </Paragraph>
                                                </div>
                                            </Col>
                                            <Col span={12}>
                                                <div style={{ marginBottom: 16 }}>
                                                    <Text strong><BankOutlined /> Tài khoản ngân hàng:</Text>
                                                    <div style={{ marginTop: 8 }}>{record.bank_account}</div>
                                                </div>
                                                <div>
                                                    <Text strong><FileTextOutlined /> Tài liệu đính kèm:</Text>
                                                    <div style={{ marginTop: 8 }}>
                                                        {record.documents?.map((doc, index) => (
                                                            <Tag key={index} style={{ margin: 2 }}>
                                                                <FileTextOutlined /> {doc}
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                )
                            }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Modal chi tiết yêu cầu nâng role */}
            <Modal
                title="Chi tiết yêu cầu nâng role"
                open={roleRequestDetailVisible}
                onCancel={() => setRoleRequestDetailVisible(false)}
                footer={
                    selectedRequest?.status === 'pending' ? [
                        <Button key="reject" danger icon={<CloseOutlined />} onClick={() => handleRejectRequest(selectedRequest)}>
                            Từ chối
                        </Button>,
                        <Button key="approve" type="primary" icon={<CheckOutlined />} onClick={() => handleApproveRequest(selectedRequest)}>
                            Duyệt yêu cầu
                        </Button>
                    ] : [
                        <Button key="close" onClick={() => setRoleRequestDetailVisible(false)}>
                            Đóng
                        </Button>
                    ]
                }
                width={800}
            >
                {selectedRequest && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card size="small" title="Thông tin cá nhân">
                                    <p><strong>Họ tên:</strong> {selectedRequest.full_name}</p>
                                    <p><strong>Username:</strong> {selectedRequest.username}</p>
                                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                                    <p><strong>Số điện thoại:</strong> {selectedRequest.phone}</p>
                                    <p><strong>Role hiện tại:</strong> <Tag color="blue">{selectedRequest.current_role}</Tag></p>
                                    <p><strong>Role yêu cầu:</strong> <Tag color="orange">{selectedRequest.requested_role}</Tag></p>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Thông tin doanh nghiệp">
                                    <p><strong>Tên doanh nghiệp:</strong> {selectedRequest.business_name}</p>
                                    <p><strong>Giấy phép KD:</strong> {selectedRequest.business_license}</p>
                                    <p><strong>Địa chỉ:</strong> {selectedRequest.business_address}</p>
                                    <p><strong>Tài khoản NH:</strong> {selectedRequest.bank_account}</p>
                                </Card>
                            </Col>
                        </Row>
                        
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={24}>
                                <Card size="small" title="Kinh nghiệm và lý do">
                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong>Kinh nghiệm:</Text>
                                        <Paragraph style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                            {selectedRequest.experience}
                                        </Paragraph>
                                    </div>
                                    <div>
                                        <Text strong>Lý do yêu cầu:</Text>
                                        <Paragraph style={{ marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                            {selectedRequest.reason}
                                        </Paragraph>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Card size="small" title="Tài liệu đính kèm">
                                    <Space direction="vertical" style={{ width: '100%' }}>
                                        {selectedRequest.documents?.map((doc, index) => (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, border: '1px solid #f0f0f0', borderRadius: 4 }}>
                                                <Space>
                                                    <FileTextOutlined />
                                                    <Text>{doc}</Text>
                                                </Space>
                                                <Button size="small" type="link">Tải xuống</Button>
                                            </div>
                                        ))}
                                    </Space>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card size="small" title="Thông tin yêu cầu">
                                    <p><strong>Ngày yêu cầu:</strong> {dayjs(selectedRequest.request_date).format('DD/MM/YYYY HH:mm')}</p>
                                    <p><strong>Trạng thái:</strong> 
                                        <Tag color={
                                            selectedRequest.status === 'pending' ? 'orange' :
                                            selectedRequest.status === 'approved' ? 'green' : 'red'
                                        } style={{ marginLeft: 8 }}>
                                            {selectedRequest.status === 'pending' ? 'Chờ duyệt' :
                                             selectedRequest.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                                        </Tag>
                                    </p>
                                    {selectedRequest.approved_date && (
                                        <>
                                            <p><strong>Ngày duyệt:</strong> {dayjs(selectedRequest.approved_date).format('DD/MM/YYYY HH:mm')}</p>
                                            <p><strong>Người duyệt:</strong> {selectedRequest.approved_by}</p>
                                        </>
                                    )}
                                    {selectedRequest.rejected_date && (
                                        <>
                                            <p><strong>Ngày từ chối:</strong> {dayjs(selectedRequest.rejected_date).format('DD/MM/YYYY HH:mm')}</p>
                                            <p><strong>Người từ chối:</strong> {selectedRequest.rejected_by}</p>
                                            {selectedRequest.rejection_reason && (
                                                <p><strong>Lý do từ chối:</strong> {selectedRequest.rejection_reason}</p>
                                            )}
                                        </>
                                    )}
                                </Card>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>

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