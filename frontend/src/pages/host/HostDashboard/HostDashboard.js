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
    Tabs,
    Radio
} from 'antd';
import {
    DollarOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BarChartOutlined,
    RiseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { handleCheckIn, handleCancelBooking, formatPrice } from './HostDashboardLogic';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const HostDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [activeTab, setActiveTab] = useState('bookings');
    const [reportType, setReportType] = useState('day');
    const [reportDateRange, setReportDateRange] = useState([dayjs().subtract(7, 'days'), dayjs()]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [selectedYear, setSelectedYear] = useState(dayjs().year());

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

    // Mock data cho báo cáo doanh thu theo ngày
    const dailyRevenueData = [
        { key: '1', date: '20/12/2024', bookings: 12, revenue: 3200000, occupancyRate: 85 },
        { key: '2', date: '19/12/2024', bookings: 8, revenue: 2100000, occupancyRate: 65 },
        { key: '3', date: '18/12/2024', bookings: 15, revenue: 4100000, occupancyRate: 95 },
        { key: '4', date: '17/12/2024', bookings: 10, revenue: 2800000, occupancyRate: 75 },
        { key: '5', date: '16/12/2024', bookings: 14, revenue: 3600000, occupancyRate: 90 },
        { key: '6', date: '15/12/2024', bookings: 9, revenue: 2300000, occupancyRate: 70 },
        { key: '7', date: '14/12/2024', bookings: 11, revenue: 2900000, occupancyRate: 80 }
    ];

    // Mock data cho báo cáo doanh thu theo tháng
    const monthlyRevenueData = [
        { key: '1', month: 'Tháng 12/2024', bookings: 320, revenue: 85000000, occupancyRate: 78 },
        { key: '2', month: 'Tháng 11/2024', bookings: 298, revenue: 79500000, occupancyRate: 72 },
        { key: '3', month: 'Tháng 10/2024', bookings: 345, revenue: 92000000, occupancyRate: 83 },
        { key: '4', month: 'Tháng 9/2024', bookings: 312, revenue: 83200000, occupancyRate: 75 },
        { key: '5', month: 'Tháng 8/2024', bookings: 367, revenue: 97800000, occupancyRate: 88 },
        { key: '6', month: 'Tháng 7/2024', bookings: 389, revenue: 103500000, occupancyRate: 92 }
    ];

    // Mock data cho báo cáo doanh thu theo năm
    const yearlyRevenueData = [
        { key: '1', year: '2024', bookings: 3890, revenue: 1035000000, occupancyRate: 82 },
        { key: '2', year: '2023', bookings: 3456, revenue: 921000000, occupancyRate: 75 },
        { key: '3', year: '2022', bookings: 3123, revenue: 832000000, occupancyRate: 68 }
    ];

    // Mock data cho chủ sân
    const hostStats = [
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

    const bookingColumns = [
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

    const getRevenueColumns = () => {
        const baseColumns = [
            {
                title: reportType === 'day' ? 'Ngày' : reportType === 'month' ? 'Tháng' : 'Năm',
                dataIndex: reportType === 'day' ? 'date' : reportType === 'month' ? 'month' : 'year',
                key: 'period',
                sorter: true
            },
            {
                title: 'Số lượng đặt sân',
                dataIndex: 'bookings',
                key: 'bookings',
                sorter: (a, b) => a.bookings - b.bookings,
                render: (value) => <span style={{ color: '#1890ff', fontWeight: 600 }}>{value}</span>
            },
            {
                title: 'Doanh thu',
                dataIndex: 'revenue',
                key: 'revenue',
                sorter: (a, b) => a.revenue - b.revenue,
                render: (amount) => <span style={{ color: '#52c41a', fontWeight: 600 }}>{formatPrice(amount)}</span>
            },
            {
                title: 'Tỷ lệ lấp đầy (%)',
                dataIndex: 'occupancyRate',
                key: 'occupancyRate',
                sorter: (a, b) => a.occupancyRate - b.occupancyRate,
                render: (rate) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: 80,
                            height: 6,
                            backgroundColor: '#f0f0f0',
                            borderRadius: 3,
                            marginRight: 8,
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${rate}%`,
                                height: '100%',
                                backgroundColor: rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{rate}%</span>
                    </div>
                )
            }
        ];
        return baseColumns;
    };

    const getCurrentRevenueData = () => {
        switch (reportType) {
            case 'day': return dailyRevenueData;
            case 'month': return monthlyRevenueData;
            case 'year': return yearlyRevenueData;
            default: return dailyRevenueData;
        }
    };

    const getRevenueStats = () => {
        const data = getCurrentRevenueData();
        const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
        const totalBookings = data.reduce((sum, item) => sum + item.bookings, 0);
        const avgOccupancy = Math.round(data.reduce((sum, item) => sum + item.occupancyRate, 0) / data.length);
        
        return [
            {
                title: `Tổng doanh thu ${reportType === 'day' ? '7 ngày' : reportType === 'month' ? '6 tháng' : '3 năm'}`,
                value: totalRevenue,
                prefix: <DollarOutlined style={{ color: '#52c41a' }} />,
                suffix: 'VNĐ'
            },
            {
                title: 'Tổng lượt đặt sân',
                value: totalBookings,
                prefix: <CalendarOutlined style={{ color: '#1890ff' }} />
            },
            {
                title: 'Tỷ lệ lấp đầy TB',
                value: avgOccupancy,
                prefix: <RiseOutlined style={{ color: '#722ed1' }} />,
                suffix: '%'
            }
        ];
    };

    const renderRevenueFilters = () => (
        <Space style={{ marginBottom: 16 }} wrap>
            <Radio.Group value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <Radio.Button value="day">Theo ngày</Radio.Button>
                <Radio.Button value="month">Theo tháng</Radio.Button>
                <Radio.Button value="year">Theo năm</Radio.Button>
            </Radio.Group>
            {reportType === 'day' && (
                <RangePicker 
                    value={reportDateRange} 
                    onChange={setReportDateRange}
                    format="DD/MM/YYYY"
                />
            )}
            {reportType === 'month' && (
                <DatePicker 
                    picker="month"
                    value={selectedMonth} 
                    onChange={setSelectedMonth}
                    format="MM/YYYY"
                    placeholder="Chọn tháng"
                />
            )}
            {reportType === 'year' && (
                <DatePicker 
                    picker="year"
                    value={dayjs().year(selectedYear)} 
                    onChange={(date) => setSelectedYear(date?.year() || dayjs().year())}
                    placeholder="Chọn năm"
                />
            )}
        </Space>
    );

    const tabItems = [
        {
            key: 'bookings',
            label: (
                <span>
                    <CalendarOutlined />
                    Đặt sân hôm nay
                </span>
            ),
            children: (
                <>
                    <DatePicker value={selectedDate} onChange={setSelectedDate} style={{ marginBottom: 16 }} />
                    <Table 
                        columns={bookingColumns} 
                        dataSource={todayBookings} 
                        pagination={false} 
                        scroll={{ x: 900 }} 
                    />
                </>
            )
        },
        {
            key: 'revenue',
            label: (
                <span>
                    <BarChartOutlined />
                    Báo cáo doanh thu
                </span>
            ),
            children: (
                <>
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                        {getRevenueStats().map((stat, idx) => (
                            <Col xs={24} md={8} key={idx}>
                                <Card>
                                    <Statistic
                                        title={stat.title}
                                        value={stat.value}
                                        prefix={stat.prefix}
                                        suffix={stat.suffix}
                                        valueStyle={{ fontSize: 18 }}
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    {renderRevenueFilters()}
                    <Table 
                        columns={getRevenueColumns()} 
                        dataSource={getCurrentRevenueData()} 
                        pagination={false}
                        scroll={{ x: 700 }}
                    />
                </>
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
                {hostStats.map((stat, idx) => (
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
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </Card>
        </div>
    );
};

export default HostDashboard;