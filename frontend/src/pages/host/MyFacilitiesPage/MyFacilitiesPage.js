
import React, { useState } from 'react';
import { Row, Col, Card, Table, Typography, Space, Tag, Button, Modal, Form, Input, Select, Upload, Statistic } from 'antd';
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

import FacilityItem from './FacilityItem';
import {
    getSportName,
    formatPrice,
    handleDeleteFacility,
    handleFacilitySubmit,
    handleStatusSubmit
} from './MyFacilitiesPageLogic';

const { Title, Text } = Typography;
const { Option } = Select;

const MyFacilitiesPage = () => {
    const [facilityModalVisible, setFacilityModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [facilities, setFacilities] = useState([
    new FacilityItem(1, 'Sân cầu lông VIP 1', 'badminton', 'Sân cầu lông chất lượng cao với sàn gỗ chuyên nghiệp', 80000, 'active', 5, 45, 400000, 3600000, '/images/badminton-1.jpg', ['Điều hòa', 'Wifi', 'Bãi đỗ xe', 'Phòng thay đồ'], '1'),
    new FacilityItem(2, 'Sân cầu lông VIP 2', 'badminton', 'Sân cầu lông tiêu chuẩn với hệ thống chiếu sáng LED', 80000, 'maintenance', 0, 32, 0, 2560000, '/images/badminton-2.jpg', ['Điều hòa', 'Wifi', 'Phòng thay đồ'], '2'),
    new FacilityItem(3, 'Sân tennis ngoài trời', 'tennis', 'Sân tennis hard court tiêu chuẩn quốc tế', 150000, 'active', 3, 28, 450000, 4200000, '/images/tennis-1.jpg', ['Bãi đỗ xe', 'Phòng thay đồ', 'Thuê vợt'], '3')
    ]);

    const facilityStats = [
        {
            title: 'Tổng sân',
            value: facilities.length,
            prefix: <ShopOutlined style={{ color: '#1890ff' }} />
        },
        {
            title: 'Đặt hôm nay',
            value: facilities.reduce((sum, f) => sum + f.bookings_today, 0),
            prefix: <CalendarOutlined style={{ color: '#52c41a' }} />
        },
        {
            title: 'Doanh thu hôm nay',
            value: facilities.reduce((sum, f) => sum + f.revenue_today, 0),
            prefix: <DollarOutlined style={{ color: '#faad14' }} />,
            formatter: (value) => formatPrice(value)
        }
    ];

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
                <Text strong style={{ color: '#1890ff' }}>{formatPrice(price)}</Text>
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
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>{formatPrice(record.revenue_today)}</Text>
                </div>
            )
        },
        {
            title: 'Tháng này',
            key: 'month',
            render: (_, record) => (
                <div>
                    <div>{record.bookings_this_month} lượt đặt</div>
                    <Text style={{ fontSize: '12px', color: '#52c41a' }}>{formatPrice(record.revenue_this_month)}</Text>
                </div>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space direction="vertical" size="small">
                    <Space>
                        <Button size="small" icon={<EyeOutlined />}>Chi tiết</Button>
                        <Button size="small" icon={<EditOutlined />} onClick={() => {
                            setSelectedFacility(record);
                            setFacilityModalVisible(true);
                        }}>Sửa</Button>
                    </Space>
                    <Space>
                        <Button size="small" icon={<ToolOutlined />} onClick={() => {
                            setSelectedFacility(record);
                            setStatusModalVisible(true);
                        }}>Trạng thái</Button>
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteFacility(record, setFacilities)}>Xóa</Button>
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
            <Card
                title="Danh sách sân"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setSelectedFacility(null);
                        setFacilityModalVisible(true);
                    }}>
                        Thêm sân mới
                    </Button>
                }
            >
                <Table
                    columns={facilityColumns}
                    dataSource={facilities}
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
                    onFinish={(values) => handleFacilitySubmit(values, setFacilities, setFacilityModalVisible, setSelectedFacility)}
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
                        onFinish={(values) => handleStatusSubmit(values, selectedFacility, setFacilities, setStatusModalVisible)}
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
