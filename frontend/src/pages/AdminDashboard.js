import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Typography,
    Space,
    Tag,
    Button,
    DatePicker,
    Select
} from 'antd';
import {
    DollarOutlined,
    UserOutlined,
    CalendarOutlined,
    ShopOutlined,
    RiseOutlined,
    EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([
        dayjs().subtract(7, 'days'),
        dayjs()
    ]);

    // Mock data
    const stats = [
        {
            title: 'Doanh thu hôm nay',
            value: 12500000,
            prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
            suffix: 'VNĐ',
            precision: 0
        },
        {
            title: 'Lượt đặt sân',
            value: 48,
            prefix: <CalendarOutlined style={{ color: '#1890ff' }} />,
        },
        {
            title: 'Người dùng mới',
            value: 12,
            prefix: <UserOutlined style={{ color: '#faad14' }} />,
        },
        {
            title: 'Tỷ lệ lấp đầy',
            value: 85.6,
            prefix: <RiseOutlined style={{ color: '#722ed1' }} />,
            suffix: '%'
        }
    ];

    const recentBookings = [
        {
            key: '1',
            id: 'BK001',
            customer: 'Nguyễn Văn A',
            facility: 'Sân cầu lông VIP 1',
            date: '2024-01-15',
            time: '08:00 - 10:00',
            amount: 160000,
            status: 'confirmed',
            payment: 'paid'
        },
        {
            key: '2',
            id: 'BK002',
            customer: 'Trần Thị B',
            facility: 'Sân tennis cao cấp',
            date: '2024-01-15',
            time: '14:00 - 16:00',
            amount: 300000,
            status: 'pending',
            payment: 'pending'
        },
        {
            key: '3',
            id: 'BK003',
            customer: 'Lê Văn C',
            facility: 'Sân bóng đá mini A',
            date: '2024-01-15',
            time: '18:00 - 20:00',
            amount: 400000,
            status: 'confirmed',
            payment: 'paid'
        },
        {
            key: '4',
            id: 'BK004',
            customer: 'Phạm Thị D',
            facility: 'Sân bóng rổ trong nhà',
            date: '2024-01-16',
            time: '09:00 - 11:00',
            amount: 240000,
            status: 'cancelled',
            payment: 'refunded'
        }
    ];

    const facilityStats = [
        {
            key: '1',
            name: 'Sân cầu lông VIP 1',
            sport: 'Cầu lông',
            bookings: 15,
            revenue: 1200000,
            utilization: 93.8
        },
        {
            key: '2',
            name: 'Sân tennis cao cấp',
            sport: 'Tennis',
            bookings: 8,
            revenue: 2400000,
            utilization: 66.7
        },
        {
            key: '3',
            name: 'Sân bóng đá mini A',
            sport: 'Bóng đá',
            bookings: 12,
            revenue: 2400000,
            utilization: 80.0
        },
        {
            key: '4',
            name: 'Sân bóng rổ trong nhà',
            sport: 'Bóng rổ',
            bookings: 10,
            revenue: 1200000,
            utilization: 71.4
        }
    ];

    const bookingColumns = [
        {
            title: 'Mã đặt',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Sân',
            dataIndex: 'facility',
            key: 'facility',
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Giờ',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount)
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    confirmed: { color: 'green', text: 'Đã xác nhận' },
                    pending: { color: 'orange', text: 'Chờ xác nhận' },
                    cancelled: { color: 'red', text: 'Đã hủy' }
                };
                return <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>;
            }
        },
        {
            title: 'Thanh toán',
            dataIndex: 'payment',
            key: 'payment',
            render: (payment) => {
                const paymentConfig = {
                    paid: { color: 'green', text: 'Đã thanh toán' },
                    pending: { color: 'orange', text: 'Chờ thanh toán' },
                    refunded: { color: 'blue', text: 'Đã hoàn tiền' }
                };
                return <Tag color={paymentConfig[payment].color}>{paymentConfig[payment].text}</Tag>;
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EyeOutlined />}>
                        Xem
                    </Button>
                </Space>
            ),
        }
    ];

    const facilityColumns = [
        {
            title: 'Tên sân',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Môn thể thao',
            dataIndex: 'sport',
            key: 'sport',
            render: (sport) => <Tag color="blue">{sport}</Tag>
        },
        {
            title: 'Lượt đặt',
            dataIndex: 'bookings',
            key: 'bookings',
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
            title: 'Tỷ lệ sử dụng',
            dataIndex: 'utilization',
            key: 'utilization',
            render: (utilization) => `${utilization}%`
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Dashboard Quản trị</Title>
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        format="DD/MM/YYYY"
                    />
                    <Select defaultValue="all" style={{ width: 120 }}>
                        <Option value="all">Tất cả sân</Option>
                        <Option value="badminton">Cầu lông</Option>
                        <Option value="football">Bóng đá</Option>
                        <Option value="tennis">Tennis</Option>
                    </Select>
                </Space>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                precision={stat.precision}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={14}>
                    <Card title="Đặt sân gần đây" extra={<Button type="link">Xem tất cả</Button>}>
                        <Table
                            columns={bookingColumns}
                            dataSource={recentBookings}
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: 800 }}
                        />
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card title="Thống kê sân" extra={<Button type="link">Xem chi tiết</Button>}>
                        <Table
                            columns={facilityColumns}
                            dataSource={facilityStats}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminDashboard;