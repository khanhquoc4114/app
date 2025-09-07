import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Typography, Space, Tag, Button, Modal, Form, Input, Select, Upload, Statistic, Rate, message, Image, TimePicker } from 'antd';
import {PlusOutlined,EditOutlined,DeleteOutlined,ToolOutlined,UploadOutlined,EyeOutlined,DollarOutlined,CalendarOutlined,ShopOutlined,EnvironmentOutlined
} from '@ant-design/icons';
import {getSportName,formatPrice,handleDeleteFacility,handleFacilitySubmit,handleStatusSubmit
} from './MyFacilitiesPageLogic';
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MyFacilitiesPage = () => {
    const [facilityModalVisible, setFacilityModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [facilities, setFacilities] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState({
        field_images: [],
    });
    const [form] = Form.useForm();

    useEffect(() => {
        if (facilityModalVisible) {
            if (selectedFacility) {
                // Khi sửa: load ảnh từ database
                const existingImages = selectedFacility.images ? selectedFacility.images.map((img, index) => ({
                    uid: `existing-${index}`,
                    name: `image-${index}.jpg`,
                    status: 'done',
                    url: img.startsWith('http') ? img : `${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/uploads/${img}`,
                    isExisting: true // Flag để phân biệt ảnh cũ và ảnh mới
                })) : [];
                
                setUploadedFiles({
                    field_images: existingImages
                });

                form.setFieldsValue({
                    ...selectedFacility,
                    sport_type: selectedFacility.sport_type,
                    court_layout_rows: selectedFacility.court_layout?.rows || 1,
                    court_layout_cols: selectedFacility.court_layout?.cols || 1
                });
            } else {
                // Khi thêm mới: reset
                setUploadedFiles({
                    field_images: [],
                });
                form.resetFields();
            }
        }
    }, [facilityModalVisible, selectedFacility, form]);

    const handleFileUpload = (fileType, info) => {
        const { fileList } = info;
        
        // Xử lý fileList để đảm bảo có preview
        const processedFileList = fileList.map(file => {
            if (!file.url && !file.preview) {
                if (file.originFileObj) {
                    // Tạo preview URL cho file mới
                    file.preview = URL.createObjectURL(file.originFileObj);
                }
            }
            return file;
        });

        setUploadedFiles(prev => ({
            ...prev,
            [fileType]: processedFileList
        }));
    };

    const uploadProps = (fileType, maxCount = 5) => ({
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
            return false; // Prevent auto upload, sẽ xử lý manual
        },
        onChange: (info) => handleFileUpload(fileType, info),
        fileList: uploadedFiles[fileType],
        maxCount,
        listType: 'picture-card',
        accept: 'image/*',
        multiple: maxCount > 1,
        onRemove: (file) => {
            // Cleanup preview URL nếu có
            if (file.preview && file.preview.startsWith('blob:')) {
                URL.revokeObjectURL(file.preview);
            }
        }
    });

    useEffect(() => {
    async function fetchFacilities() {
        try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/facilities/host`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        setFacilities(data);
        } catch (err) {
            console.error("Error fetching facilities:", err);
        }
    }

    fetchFacilities();
    }, []);

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

    const handleSubmit = (values) => {
        // Chuẩn bị data để gửi
        const formattedValues = {
            ...values,
            court_layout: {
                rows: values.court_layout_rows,
                cols: values.court_layout_cols,
                total_courts: values.court_layout_rows * values.court_layout_cols
            },
            // Thêm thông tin ảnh
            images: uploadedFiles.field_images
        };
        
        // Xóa các field không cần thiết
        delete formattedValues.court_layout_rows;
        delete formattedValues.court_layout_cols;

        handleFacilitySubmit(formattedValues, setFacilities, setFacilityModalVisible, setSelectedFacility);
    };

    const handleCancel = () => {
        // Cleanup preview URLs
        uploadedFiles.field_images.forEach(file => {
            if (file.preview && file.preview.startsWith('blob:')) {
                URL.revokeObjectURL(file.preview);
            }
        });
        
        setFacilityModalVisible(false);
        setSelectedFacility(null);
        setUploadedFiles({ field_images: [] });
        form.resetFields();
    };

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
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    is_active: true,
                    sport_type: [],
                    court_layout_rows: 1,
                    court_layout_cols: 1
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
                            <Input type="number" step={1000} min={0} placeholder="Nhập giá thuê" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                        name="opening_hours"
                        label="Giờ mở cửa"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ mở cửa' }]}
                        >
                        <TimePicker.RangePicker
                            format="HH:mm"
                            placeholder={['Giờ mở', 'Giờ đóng']}
                            style={{ width: '100%' }}
                            minuteStep={30}
                        />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="is_active" label="Trạng thái">
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

                {/* Upload nhiều ảnh - chỉ preview */}
                <Form.Item name="images" label="Hình ảnh sân (tối đa 10 ảnh)">
                    <Upload {...uploadProps("field_images", 10)} showUploadList={false}>
                        {uploadedFiles.field_images.length < 10 && (
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>Chỉ xem trước</div>
                            </div>
                        )}
                    </Upload>

                    {/* Hiển thị preview ảnh dạng Image component */}
                    {uploadedFiles.field_images.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                            <div style={{ marginBottom: 12 }}>
                                <span style={{ color: '#666', fontSize: '14px', fontWeight: 'bold' }}>
                                    Đã chọn {uploadedFiles.field_images.length}/10 ảnh
                                </span>
                            </div>
                            
                            {/* Grid hiển thị ảnh */}
                            <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 8,
                                padding: 8,
                                backgroundColor: '#f5f5f5',
                                borderRadius: 4
                            }}>
                                {uploadedFiles.field_images.map((file, index) => {
                                    const imageUrl = file.url || file.preview || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null);
                                    return (
                                        <div key={file.uid} style={{ position: 'relative' }}>
                                            <Image
                                                src={imageUrl}
                                                alt={`Preview ${index + 1}`}
                                                style={{
                                                    width: 120,
                                                    height: 90,
                                                    objectFit: 'cover',
                                                    border: '2px solid #d9d9d9',
                                                    borderRadius: 6
                                                }}
                                                preview={{
                                                    mask: 'Xem'
                                                }}
                                                fallback="data:image/svg+xml,%3Csvg%20width='120'%20height='90'%20xmlns='http://www.w3.org/2000/svg'%3E%3Crect%20width='100%25'%20height='100%25'%20fill='%23f0f0f0'/%3E%3Ctext%20x='50%25'%20y='50%25'%20text-anchor='middle'%20dy='.3em'%20fill='%23999'%20font-size='12'%3ELỗi%3C/text%3E%3C/svg%3E"
                                            />
                                            {/* Nút xóa ảnh */}
                                            <Button
                                                type="primary"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                style={{
                                                    position: 'absolute',
                                                    top: -8,
                                                    right: -8,
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                onClick={() => {
                                                    // Xóa ảnh khỏi danh sách
                                                    const newFileList = uploadedFiles.field_images.filter(f => f.uid !== file.uid);
                                                    setUploadedFiles(prev => ({
                                                        ...prev,
                                                        field_images: newFileList
                                                    }));
                                                    
                                                    // Cleanup preview URL
                                                    if (file.preview && file.preview.startsWith('blob:')) {
                                                        URL.revokeObjectURL(file.preview);
                                                    }
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
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
                        <Button onClick={handleCancel}>
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