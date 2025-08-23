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
    const [stats, setStats] = React.useState({
        facilities: 0,
        bookings: 0,
        users: 0,
    });
    const [popularSports, setPopularSports] = React.useState([]);

const sportMeta = React.useMemo(() => ({
    badminton: { name: "Cầu lông", image: "🏸", description: "Sân cầu lông chất lượng cao" },
    football: { name: "Bóng đá", image: "⚽", description: "Sân bóng đá cỏ nhân tạo" },
    tennis: { name: "Tennis", image: "🎾", description: "Sân tennis tiêu chuẩn quốc tế" },
    basketball: { name: "Bóng rổ", image: "🏀", description: "Sân bóng rổ trong nhà và ngoài trời" },
}), []); // chỉ tạo 1 lần

React.useEffect(() => {
    const fetchPopularSports = async () => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/facilities/popular-sports`);
            const data = await res.json();

            const merged = data.map(item => ({
                ...sportMeta[item.sportType],
                sportType: item.sportType,
                courts: item.courts
            }));

            setPopularSports(merged);
        } catch (err) {
            console.error("Lỗi fetch popular sports:", err);
        }
    };

    fetchPopularSports();
}, [sportMeta]);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/facilities/count`);
                const data = await res.json();
                setStats(prev => ({ ...prev, facilities: data.count }));
            } catch (err) {
                console.error("Lỗi fetch stats:", err); 
            }
        };

        fetchStats();
    }, []);

    const statItems = [
        {
            title: 'Tổng số sân',
            value: stats.facilities,
            icon: <ShopOutlined style={{ color: '#1890ff' }} />,
        },
        {
            title: 'Lượt đặt hôm nay',
            value: stats.bookings,
            icon: <CalendarOutlined style={{ color: '#52c41a' }} />,
        },
        {
            title: 'Người dùng hoạt động',
            value: stats.users,
            icon: <UserOutlined style={{ color: '#faad14' }} />,
        },
    ];

    const handleSportClick = (sport) => {
        // Navigate to facilities page with sport filter
        navigate(`/facilities?sport=${sport.sportType}`);
    };

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <Title level={2}>Chào mừng đến với hệ thống quản lý sân thể thao</Title>
                <Paragraph>
                    Đặt sân thể thao dễ dàng, nhanh chóng với hệ thống real-time hiện đại
                </Paragraph>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
                {statItems.map((stat, index) => (
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
                            onClick={() => handleSportClick(sport)}
                            style={{ cursor: 'pointer' }}
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