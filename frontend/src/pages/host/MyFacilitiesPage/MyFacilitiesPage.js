import React, { useState } from 'react';
import { Row, Col, Card, Table, Typography, Space, Tag, Button, Modal, Form, Input, Select, Upload, Statistic, Rate } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ToolOutlined,
    UploadOutlined,
    EyeOutlined,
    DollarOutlined,
    CalendarOutlined,
    ShopOutlined,
    StarOutlined,
    EnvironmentOutlined
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
const { TextArea } = Input;

const MyFacilitiesPage = () => {
    const [facilityModalVisible, setFacilityModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [facilities, setFacilities] = useState([
        {
            id: 1,
            name: 'Sân cầu lông VIP 1',
            sport_type: ['badminton'],
            description: 'Sân cầu lông chất lượng cao với sàn gỗ chuyên nghiệp',
            price_per_hour: 80000,
            image_url: '/images/badminton-1.jpg',
            location: '123 Nguyễn Văn A, Quận 1, TP.HCM',
            rating: 4.5,
            reviews_count: 125,
            amenities: ['Điều hòa', 'Wifi', 'Bãi đỗ xe', 'Phòng thay đồ'],
            opening_hours: '06:00 - 22:00',
            is_active: true,
            court_layout: { rows: 2, cols: 1, total_courts: 2 },
            // Mock data for statistics
            bookings_today: 5,
            revenue_today: 400000,
            bookings_this_month: 45,
            revenue_this_month: 3600000
        },
        {
            id: 2,
            name: 'Sân cầu lông VIP 2',
            sport_type: ['badminton'],
            description: 'Sân cầu lông tiêu chuẩn với hệ thống chiếu sáng LED',
            price_per_hour: 80000,
            image_url: '/images/badminton-2.jpg',
            location: '456 Lê Văn B, Quận 2, TP.HCM',
            rating: 4.2,
            reviews_count: 89,
            amenities: ['Điều hòa', 'Wifi', 'Phòng thay đồ'],
            opening_hours: '05:30 - 23:00',
            is_active: false, // maintenance
            court_layout: { rows: 1, cols: 2, total_courts: 2 },
            bookings_today: 0,
            revenue_today: 0,
            bookings_this_month: 32,
            revenue_this_month: 2560000
        },
        {
            id: 3,
            name: 'Sân tennis ngoài trời',
            sport_type: ['tennis'],
            description: 'Sân tennis hard court tiêu chuẩn quốc tế',
            price_per_hour: 150000,
            image_url: '/images/tennis-1.jpg',
            location: '789 Trần Văn C, Quận 3, TP.HCM',
            rating: 4.8,
            reviews_count: 203,
            amenities: ['Bãi đỗ xe', 'Phòng thay đồ', 'Thuê vợt'],
            opening_hours: '06:00 - 21:00',
            is_active: true,
            court_layout: { rows: 1, cols: 3, total_courts: 3 },
            bookings_today: 3,
            revenue_today: 450000,
            bookings_this_month: 28,
            revenue_this_month: 4200000
        }
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
                    <Space size={4}>
                        {record.sport_type.map(sport => (
                            <Tag color="blue" size="small" key={sport}>
                                {getSportName(sport)}
                            </Tag>
                        ))}
                    </Space>
                    <br />
                    <Space size={4} style={{ marginTop: 4 }}>
                        <EnvironmentOutlined style={{ fontSize: '12px', color: '#999' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.location}
                        </Text>
                    </Space>
                </div>
            ),
            width: 280
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
            title: 'Đánh giá',
            key: 'rating',
            render: (_, record) => (
                <div>
                    <Space>
                        <Rate disabled value={record.rating} style={{ fontSize: '12px' }} />
                        <Text style={{ fontSize: '12px' }}>{record.rating}</Text>
                    </Space>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                        {record.reviews_count} đánh giá
                    </Text>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (is_active) => (
                <Tag color={is_active ? 'green' : 'red'}>
                    {is_active ? 'Hoạt động' : 'Tạm ngưng'}
                </Tag>
            )
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
                    scroll={{ x: 1200 }}
                    rowKey="id"
                />
            </Card>

            {/* Add/Edit Facility Modal */}
            <Modal
                title={selectedFacility ? 'Sửa thông tin sân' : 'Thêm sân mới'}
                open={facilityModalVisible}
                onCancel={() => setFacilityModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    layout="vertical"
                    initialValues={selectedFacility ? {
                        ...selectedFacility,
                        sport_type: selectedFacility.sport_type,
                        court_layout_rows: selectedFacility.court_layout?.rows || 1,
                        court_layout_cols: selectedFacility.court_layout?.cols || 1
                    } : {
                        is_active: true,
                        sport_type: [],
                        court_layout_rows: 1,
                        court_layout_cols: 1
                    }}
                    onFinish={(values) => {
                        const formattedValues = {
                            ...values,
                            court_layout: {
                                rows: values.court_layout_rows,
                                cols: values.court_layout_cols,
                                total_courts: values.court_layout_rows * values.court_layout_cols
                            }
                        };
                        delete formattedValues.court_layout_rows;
                        delete formattedValues.court_layout_cols;
                        handleFacilitySubmit(formattedValues, setFacilities, setFacilityModalVisible, setSelectedFacility);
                    }}
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
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một môn thể thao' }]}
                            >
                                <Select mode="multiple" placeholder="Chọn môn thể thao">
                                    <Option value="badminton">Cầu lông</Option>
                                    <Option value="football">Bóng đá</Option>
                                    <Option value="tennis">Tennis</Option>
                                    <Option value="basketball">Bóng rổ</Option>
                                    <Option value="volleyball">Bóng chuyền</Option>
                                    <Option value="pingpong">Bóng bàn</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <TextArea rows={3} placeholder="Mô tả chi tiết về sân" />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input placeholder="Nhập địa chỉ đầy đủ" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="price_per_hour"
                                label="Giá thuê (VNĐ/giờ)"
                                rules={[{ required: true, message: 'Vui lòng nhập giá thuê' }]}
                            >
                                <Input type="number" placeholder="Nhập giá thuê" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="opening_hours"
                                label="Giờ mở cửa"
                                rules={[{ required: true, message: 'Vui lòng nhập giờ mở cửa' }]}
                            >
                                <Input placeholder="VD: 06:00 - 22:00" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="is_active" label="Trạng thái" valuePropName="checked">
                                <Select>
                                    <Option value={true}>Hoạt động</Option>
                                    <Option value={false}>Tạm ngưng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="court_layout_rows"
                                label="Số hàng sân"
                                rules={[{ required: true, message: 'Vui lòng nhập số hàng' }]}
                            >
                                <Input type="number" min={1} placeholder="Số hàng sân" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="court_layout_cols"
                                label="Số cột sân"
                                rules={[{ required: true, message: 'Vui lòng nhập số cột' }]}
                            >
                                <Input type="number" min={1} placeholder="Số cột sân" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="image_url" label="Hình ảnh sân">
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
                            <Option value="Phòng tắm">Phòng tắm</Option>
                            <Option value="Tủ khóa">Tủ khóa</Option>
                            <Option value="Nước uống">Nước uống</Option>
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
                        initialValues={{ is_active: selectedFacility.is_active }}
                        onFinish={(values) => handleStatusSubmit(values, selectedFacility, setFacilities, setStatusModalVisible)}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Sân: </Text>
                            <Text>{selectedFacility.name}</Text>
                        </div>
                        <Form.Item
                            name="is_active"
                            label="Trạng thái mới"
                            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                        >
                            <Select>
                                <Option value={true}>Hoạt động</Option>
                                <Option value={false}>Tạm ngưng</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="reason" label="Lý do thay đổi">
                            <TextArea rows={3} placeholder="Nhập lý do (tùy chọn)" />
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