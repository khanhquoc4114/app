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
    Modal,
    message
} from 'antd';
import {
    DollarOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const StaffDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());

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

    const todayBookings = [
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
            facility: 'Sân cầu lông VIP 2',
            time: '18:00 - 20:00',
            amount: 160000,
            status: 'confirmed',
            checkedIn: true
        }
    ];



    const handleConfirmBooking = (record) => {
        message.success(`Đã xác nhận đặt sân ${record.id}`);
    };

    const handleRejectBooking = (record) => {
        Modal.confirm({
            title: 'Xác nhận từ chối',
            content: `Bạn có chắc muốn từ chối đặt sân ${record.id}?`,
            onOk: () => {
                message.success(`Đã từ chối đặt sân ${record.id}`);
            }
        });
    };

    const handleCheckIn = (record) => {
        message.success(`Khách hàng ${record.customer} đã check-in`);
    };

    const handleCheckOut = (record) => {
        message.success(`Khách hàng ${record.customer} đã check-out`);
    };

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
            title: 'SĐT',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Sân',
            dataIndex: 'facility',
            key: 'facility',
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
                const config = {
                    confirmed: { color: 'green', text: 'Đã xác nhận' },
                    pending: { color: 'orange', text: 'Chờ xác nhận' },
                    cancelled: { color: 'red', text: 'Đã hủy' }
                };
                return <Tag color={config[status].color}>{config[status].text}</Tag>;
            }
        },
        {
            title: 'Check-in',
            dataIndex: 'checkedIn',
            key: 'checkedIn',
            render: (checkedIn) => (
                <Tag color={checkedIn ? 'green' : 'default'}>
                    {checkedIn ? 'Đã vào' : 'Chưa vào'}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'pending' && (
                        <>
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => handleConfirmBooking(record)}
                            >
                                Xác nhận
                            </Button>
                            <Button
                                size="small"
                                danger
                                onClick={() => handleRejectBooking(record)}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                    {record.status === 'confirmed' && !record.checkedIn && (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => handleCheckIn(record)}
                        >
                            Check-in
                        </Button>
                    )}
                    {record.status === 'confirmed' && record.checkedIn && (
                        <Button
                            size="small"
                            onClick={() => handleCheckOut(record)}
                        >
                            Check-out
                        </Button>
                    )}
                </Space>
            ),
        }
    ];



    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Dashboard Chủ sân</Title>
                <Text type="secondary">Quản lý sân thể thao của bạn</Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {staffStats.map((stat, index) => (
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

            <Card
                title={`Lịch đặt sân - ${selectedDate.format('DD/MM/YYYY')}`}
                extra={
                    <DatePicker
                        value={selectedDate}
                        onChange={setSelectedDate}
                        format="DD/MM/YYYY"
                    />
                }
            >
                <Table
                    columns={bookingColumns}
                    dataSource={todayBookings}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    );
};

export default StaffDashboard;