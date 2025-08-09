import React from 'react';
import { Row, Col, Card, Statistic, Button, Typography } from 'antd';
import {
    ShopOutlined,
    CalendarOutlined,
    UserOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const HomePage = () => {
    const navigate = useNavigate();

    const stats = [
        {
            title: 'Tổng số sân',
            value: 25,
            icon: <ShopOutlined style={{ color: '#1890ff' }} />,
        },
        {
            title: 'Lượt đặt hôm nay',
            value: 48,
            icon: <CalendarOutlined style={{ color: '#52c41a' }} />,
        },
        {
            title: 'Người dùng hoạt động',
            value: 156,
            icon: <UserOutlined style={{ color: '#faad14' }} />,
        },
    ];

    const popularSports = [
        {
            name: 'Cầu lông',
            courts: 8,
            image: '🏸',
            description: 'Sân cầu lông chất lượng cao với hệ thống chiếu sáng hiện đại'
        },
        {
            name: 'Bóng đá',
            courts: 4,
            image: '⚽',
            description: 'Sân bóng đá cỏ nhân tạo, phù hợp cho các trận đấu 5v5, 7v7'
        },
        {
            name: 'Tennis',
            courts: 6,
            image: '🎾',
            description: 'Sân tennis tiêu chuẩn quốc tế với mặt sân chuyên nghiệp'
        },
        {
            name: 'Bóng rổ',
            courts: 3,
            image: '🏀',
            description: 'Sân bóng rổ trong nhà và ngoài trời với rổ chuẩn NBA'
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={2}>Chào mừng đến với hệ thống quản lý sân thể thao</Title>
                <Paragraph>
                    Đặt sân thể thao dễ dàng, nhanh chóng với hệ thống real-time hiện đại
                </Paragraph>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                prefix={stat.icon}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Title level={3} style={{ marginBottom: 24 }}>Các môn thể thao phổ biến</Title>

            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {popularSports.map((sport, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <Card
                            className="facility-card"
                            hoverable
                            onClick={() => navigate('/facilities')}
                        >
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <div style={{ fontSize: '48px', marginBottom: 8 }}>
                                    {sport.image}
                                </div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {sport.name}
                                </Title>
                                <Paragraph type="secondary">
                                    {sport.courts} sân có sẵn
                                </Paragraph>
                            </div>
                            <Paragraph style={{ fontSize: '12px', color: '#666' }}>
                                {sport.description}
                            </Paragraph>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Card style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Title level={3} style={{ color: 'white', marginBottom: 16 }}>
                    Sẵn sàng đặt sân?
                </Title>
                <Paragraph style={{ color: 'white', marginBottom: 24 }}>
                    Khám phá các sân thể thao chất lượng cao và đặt lịch ngay hôm nay
                </Paragraph>
                <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate('/facilities')}
                >
                    Xem tất cả sân
                </Button>
            </Card>
        </div>
    );
};

export default HomePage;