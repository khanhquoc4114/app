import React, { useState } from 'react';
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
    Modal
} from 'antd';
import {
    DollarOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleCheckIn, handleCancelBooking, formatPrice } from './StaffDashboardLogic';

const { Title, Text } = Typography;

const StaffDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [todayBookings, setTodayBookings] = useState([
        {
            key: '1',
            id: 'BK001',
            customer: 'Nguyễn Văn A',
            phone: '0901234567',
            facility: 'Sân cầu lông VIP 1',
            time: '08:00 - 10:00',
            amount: 160000,
            status: 'confirmed',
            checkedIn: false
        },
        {
            key: '2',
            id: 'BK002',
            customer: 'Trần Thị B',
            phone: '0907654321',
            facility: 'Sân cầu lông VIP 1',
            time: '14:00 - 16:00',
            amount: 160000,
            status: 'pending',
            checkedIn: false
        },
        {
            key: '3',
            id: 'BK003',
            customer: 'Lê Văn C',
            phone: '0912345678',
            facility: 'Sân tennis cao cấp',
            time: '16:00 - 18:00',
            amount: 300000,
            status: 'confirmed',
            checkedIn: true
        }
    ]);

    // Mock data cho chủ sân
    const staffStats = [
        {
            title: 'Doanh thu hôm nay',
            value: 2400000,
            prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
            suffix: 'VNĐ'
        },
        {
            title: 'Đặt sân hôm nay',
            value: 8,
            prefix: <CalendarOutlined style={{ color: '#1890ff' }} />
        },
        {
            title: 'Chờ xác nhận',
            value: 3,
            prefix: <CloseCircleOutlined style={{ color: '#faad14' }} />
        },
        {
            title: 'Tỷ lệ lấp đầy',
            value: 75,
            prefix: <CheckCircleOutlined style={{ color: '#722ed1' }} />,
            suffix: '%'
        }
    ];

    const columns = [
        {
            title: 'Mã đặt',
            dataIndex: 'id',
            key: 'id',
            width: 100
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Sân',
            dataIndex: 'facility',
            key: 'facility',
        },
        {
            title: 'Thời gian',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => <span style={{ color: '#1890ff', fontWeight: 600 }}>{formatPrice(amount)}</span>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'confirmed' ? 'green' : 'orange'}>
                    {status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                </Tag>
            )
        },
        {
            title: 'Check-in',
            key: 'checkin',
            render: (_, record) => (
                record.checkedIn ? (
                    <Tag color="blue">Đã check-in</Tag>
                ) : (
                    <Button size="small" type="primary" onClick={() => handleCheckIn(record, setTodayBookings)}>
                        Check-in
                    </Button>
                )
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button size="small" danger onClick={() => handleCancelBooking(record, setTodayBookings)}>
                    Huỷ
                </Button>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Dashboard chủ sân</Title>
                <Text type="secondary">Quản lý đặt sân, doanh thu và check-in</Text>
            </div>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                {staffStats.map((stat, idx) => (
                    <Col xs={12} md={6} key={idx}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                                valueStyle={{ fontSize: 20 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
            <Card title="Danh sách đặt sân hôm nay">
                <DatePicker value={selectedDate} onChange={setSelectedDate} style={{ marginBottom: 16 }} />
                <Table columns={columns} dataSource={todayBookings} pagination={false} scroll={{ x: 900 }} />
            </Card>
        </div>
    );
};

export default StaffDashboard;
