import React, { useState } from 'react';
import {
    Row,
    Col,
    Card,
    Table,
    Typography,
    Space,
    Tag,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Upload,
    message,
    Statistic,
    Switch
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ToolOutlined,
    UploadOutlined,
    EyeOutlined,
    DollarOutlined,
    CalendarOutlined,
    ShopOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const MyFacilitiesPage = () => {
    const [facilityModalVisible, setFacilityModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);

    // Mock data
    const myFacilities = [
        {
            key: '1',
            id: 1,
            name: 'Sân cầu lông VIP 1',
            sport_type: 'badminton',
            description: 'Sân cầu lông chất lượng cao với sàn gỗ chuyên nghiệp',
            price_per_hour: 80000,
            status: 'active',
            bookings_today: 5,
            bookings_this_month: 45,
            revenue_today: 400000,
            revenue_this_month: 3600000,
            image_url: '/images/badminton-1.jpg',
            amenities: ['Điều hòa', 'Wifi', 'Bãi đỗ xe', 'Phòng thay đồ']
        },
        {
            key: '2',
            id: 2,
            name: 'Sân cầu lông VIP 2',
            sport_type: 'badminton',
            description: 'Sân cầu lông tiêu chuẩn với hệ thống chiếu sáng LED',
            price_per_hour: 80000,
            status: 'maintenance',
            bookings_today: 0,
            bookings_this_month: 32,
            revenue_today: 0,
            revenue_this_month: 2560000,
            image_url: '/images/badminton-2.jpg',
            amenities: ['Điều hòa', 'Wifi', 'Phòng thay đồ']
        },
        {
            key: '3',
            id: 3,
            name: 'Sân tennis ngoài trời',
            sport_type: 'tennis',
            description: 'Sân tennis hard court tiêu chuẩn quốc tế',
            price_per_hour: 150000,
            status: 'active',
            bookings_today: 3,
            bookings_this_month: 28,
            revenue_today: 450000,
            revenue_this_month: 4200000,
            image_url: '/images/tennis-1.jpg',
            amenities: ['Bãi đỗ xe', 'Phòng thay đồ', 'Thuê vợt']
        }
    ];

    const facilityStats = [
        {
            title: 'Tổng sân',
            value: myFacilities.length,
            prefix: <ShopOutlined style={{ color: '#1890ff' }} />
        },
        {
            title: 'Đặt hôm nay',
            value: myFacilities.reduce((sum, f) => sum + f.bookings_today, 0),
            prefix: <CalendarOutlined style={{ color: '#52c41a' }} />
        },
        {
            title: 'Doanh thu hôm nay',
            value: myFacilities.reduce((sum, f) => sum + f.revenue_today, 0),
            prefix: <DollarOutlined style={{ color: '#faad14' }} />,
            formatter: (value) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(value)
        }
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
            content: `Bạn có chắc muốn xóa sân "${record.name}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: () => {
                message.success(`Đã xóa sân ${record.name}`);
            }
        });
    };

    const handleChangeStatus = (record) => {
        setSelectedFacility(record);
        setStatusModalVisible(true);
    };

    const handleStatusSubmit = (values) => {
        message.success(`Đã cập nhật trạng thái sân ${selectedFacility.name}`);
        setStatusModalVisible(false);
    };

    const handleFacilitySubmit = (values) => {
        if (selectedFacility) {
            message.success(`Đã cập nhật thông tin sân ${values.name}`);
        } else {
            message.success(`Đã thêm sân mới ${values.name}`);
        }
        setFacilityModalVisible(false);
    };

    const getSportName = (sportType) => {
        const names = {
            badminton: 'Cầu lông',
            football: 'Bóng đá',
            tennis: 'Tennis',
            basketball: 'Bóng rổ'
        };
        return names[sportType] || sportType;
    };

    const facilityColumns = [
        {
            title: 'Sân',
            key: 'facility',
            render: (_, record) => (
                <div>
                    <Text strong style={{ fontSize: '14px' }}>{record.name}</Text>
                    <br />
                    <Tag color="blue" size="small">
                        {getSportName(record.sport_type)}
                    </Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {record.description}
                    </Text>
                </div>
            ),
            width: 250
        },
        {
            title: 'Giá/giờ',
            dataIndex: 'price_per_hour',
            key: 'price_per_hour',
            render: (price) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price)}
                </Text>
            )
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
            title: 'Hôm nay',
            key: 'today',
            render: (_, record) => (
                <div>
                    <div>{record.bookings_today} lượt đặt</div>
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(record.revenue_today)}
                    </Text>
                </div>
            )
        },
        {
            title: 'Tháng này',
            key: 'month',
            render: (_, record) => (
                <div>
                    <div>{record.bookings_this_month} lượt đặt</div>
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                        {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                        }).format(record.revenue_this_month)}
                    </Text>
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Space>
                        <Button size="small" icon={<EyeOutlined />}>
                            Chi tiết
                        </Button>
                        <Button size="small" icon={<EditOutlined />} onClick={() => handleEditFacility(record)}>
                            Sửa
                        </Button>
                    </Space>
                    <Space>
                        <Button size="small" icon={<ToolOutlined />} onClick={() => handleChangeStatus(record)}>
                            Trạng thái
                        </Button>
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteFacility(record)}>
                            Xóa
                        </Button>
                    </Space>
                </Space>
            ),
            width: 150
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Quản lý sân của tôi</Title>
                <Text type="secondary">Quản lý thông tin và trạng thái các sân thể thao</Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {facilityStats.map((stat, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.prefix}
                                formatter={stat.formatter}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Facilities Table */}
            <Card
                title="Danh sách sân"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddFacility}>
                        Thêm sân mới
                    </Button>
                }
            >
                <Table
                    columns={facilityColumns}
                    dataSource={myFacilities}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Add/Edit Facility Modal */}
            <Modal
                title={selectedFacility ? 'Sửa thông tin sân' : 'Thêm sân mới'}
                open={facilityModalVisible}
                onCancel={() => setFacilityModalVisible(false)}
                footer={null}
                width={700}
            >
                <Form
                    layout="vertical"
                    initialValues={selectedFacility}
                    onFinish={handleFacilitySubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Tên sân"
                                rules={[{ required: true, message: 'Vui lòng nhập tên sân' }]}
                            >
                                <Input placeholder="Nhập tên sân" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="sport_type"
                                label="Môn thể thao"
                                rules={[{ required: true, message: 'Vui lòng chọn môn thể thao' }]}
                            >
                                <Select placeholder="Chọn môn thể thao">
                                    <Option value="badminton">Cầu lông</Option>
                                    <Option value="football">Bóng đá</Option>
                                    <Option value="tennis">Tennis</Option>
                                    <Option value="basketball">Bóng rổ</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Mô tả chi tiết về sân" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="price_per_hour"
                                label="Giá thuê (VNĐ/giờ)"
                                rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                            >
                                <Input type="number" placeholder="Nhập giá thuê" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Trạng thái" initialValue="active">
                                <Select>
                                    <Option value="active">Hoạt động</Option>
                                    <Option value="maintenance">Bảo trì</Option>
                                    <Option value="inactive">Tạm ngưng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="image" label="Hình ảnh sân">
                        <Upload>
                            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item name="amenities" label="Tiện ích">
                        <Select mode="multiple" placeholder="Chọn tiện ích">
                            <Option value="Điều hòa">Điều hòa</Option>
                            <Option value="Wifi">Wifi</Option>
                            <Option value="Bãi đỗ xe">Bãi đỗ xe</Option>
                            <Option value="Phòng thay đồ">Phòng thay đồ</Option>
                            <Option value="Căng tin">Căng tin</Option>
                            <Option value="Thuê vợt">Thuê vợt</Option>
                        </Select>
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

            {/* Status Change Modal */}
            <Modal
                title="Thay đổi trạng thái sân"
                open={statusModalVisible}
                onCancel={() => setStatusModalVisible(false)}
                footer={null}
            >
                {selectedFacility && (
                    <Form
                        layout="vertical"
                        initialValues={{ status: selectedFacility.status }}
                        onFinish={handleStatusSubmit}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Sân: </Text>
                            <Text>{selectedFacility.name}</Text>
                        </div>

                        <Form.Item
                            name="status"
                            label="Trạng thái mới"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select>
                                <Option value="active">Hoạt động</Option>
                                <Option value="maintenance">Bảo trì</Option>
                                <Option value="inactive">Tạm ngưng</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="reason" label="Lý do thay đổi">
                            <Input.TextArea rows={3} placeholder="Nhập lý do (tùy chọn)" />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    Cập nhật
                                </Button>
                                <Button onClick={() => setStatusModalVisible(false)}>
                                    Hủy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default MyFacilitiesPage;