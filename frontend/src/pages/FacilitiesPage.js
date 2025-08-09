import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Button,
    Select,
    Input,
    Tag,
    Rate,
    Typography,
    Space,
    Spin
} from 'antd';
import {
    SearchOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    DollarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch from '../components/AdvancedSearch';
import { FadeInCard } from '../components/AnimatedComponents';
import { FacilityListSkeleton } from '../components/LoadingSkeletons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const FacilitiesPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [facilities, setFacilities] = useState([]);
    const [filteredFacilities, setFilteredFacilities] = useState([]);
    const [selectedSport, setSelectedSport] = useState('all');
    const [searchText, setSearchText] = useState('');

    // Mock data - sẽ thay thế bằng API call
    const mockFacilities = [
        {
            id: 1,
            name: 'Sân cầu lông VIP 1',
            sport: 'badminton',
            sportName: 'Cầu lông',
            price: 80000,
            rating: 4.8,
            location: 'Quận 1, TP.HCM',
            image: '🏸',
            amenities: ['Điều hòa', 'Thay đồ', 'Nước uống'],
            openTime: '06:00 - 22:00',
            available: true
        },
        {
            id: 2,
            name: 'Sân bóng đá mini A',
            sport: 'football',
            sportName: 'Bóng đá',
            price: 200000,
            rating: 4.5,
            location: 'Quận 3, TP.HCM',
            image: '⚽',
            amenities: ['Cỏ nhân tạo', 'Đèn chiếu sáng', 'Bãi đỗ xe'],
            openTime: '05:00 - 23:00',
            available: true
        },
        {
            id: 3,
            name: 'Sân tennis cao cấp',
            sport: 'tennis',
            sportName: 'Tennis',
            price: 150000,
            rating: 4.9,
            location: 'Quận 7, TP.HCM',
            image: '🎾',
            amenities: ['Mặt sân chuyên nghiệp', 'Thay đồ VIP', 'Căng tin'],
            openTime: '06:00 - 21:00',
            available: false
        },
        {
            id: 4,
            name: 'Sân bóng rổ trong nhà',
            sport: 'basketball',
            sportName: 'Bóng rổ',
            price: 120000,
            rating: 4.6,
            location: 'Quận 10, TP.HCM',
            image: '🏀',
            amenities: ['Sàn gỗ chuyên nghiệp', 'Điều hòa', 'Âm thanh'],
            openTime: '07:00 - 22:00',
            available: true
        },
        {
            id: 5,
            name: 'Sân cầu lông tiêu chuẩn',
            sport: 'badminton',
            sportName: 'Cầu lông',
            price: 60000,
            rating: 4.3,
            location: 'Quận 5, TP.HCM',
            image: '🏸',
            amenities: ['Sàn gỗ', 'Thay đồ', 'Wifi miễn phí'],
            openTime: '06:00 - 23:00',
            available: true
        },
        {
            id: 6,
            name: 'Sân bóng đá 7v7',
            sport: 'football',
            sportName: 'Bóng đá',
            price: 300000,
            rating: 4.7,
            location: 'Quận 2, TP.HCM',
            image: '⚽',
            amenities: ['Cỏ tự nhiên', 'Khán đài', 'Phòng thay đồ'],
            openTime: '05:30 - 22:30',
            available: true
        }
    ];

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setFacilities(mockFacilities);
            setFilteredFacilities(mockFacilities);
            setLoading(false);
        }, 1000);
    }, []);

    useEffect(() => {
        let filtered = facilities;

        if (selectedSport !== 'all') {
            filtered = filtered.filter(facility => facility.sport === selectedSport);
        }

        if (searchText) {
            filtered = filtered.filter(facility =>
                facility.name.toLowerCase().includes(searchText.toLowerCase()) ||
                facility.location.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredFacilities(filtered);
    }, [selectedSport, searchText, facilities]);

    const handleBooking = (facilityId) => {
        navigate(`/booking/${facilityId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (loading) {
        return <FacilityListSkeleton />;
    }

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={2}>Danh sách sân thể thao</Title>
            </div>

            <AdvancedSearch
                onSearch={setSearchText}
                onFilterChange={(filters) => {
                    setSelectedSport(filters.sport);
                    setSearchText(filters.keyword);
                }}
            />

            <Row gutter={[16, 16]}>
                {filteredFacilities.map((facility) => (
                    <Col xs={24} sm={12} lg={8} key={facility.id}>
                        <Card
                            className="facility-card"
                            cover={
                                <div style={{
                                    height: 200,
                                    background: 'linear-gradient(45deg, #f0f2f5, #e6f7ff)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '64px'
                                }}>
                                    {facility.image}
                                </div>
                            }
                            actions={[
                                <Button
                                    type="primary"
                                    disabled={!facility.available}
                                    onClick={() => handleBooking(facility.id)}
                                    style={{ width: '90%' }}
                                >
                                    {facility.available ? 'Đặt sân ngay' : 'Hết chỗ'}
                                </Button>
                            ]}
                        >
                            <Card.Meta
                                title={
                                    <Space direction="vertical" size={4}>
                                        <Text strong>{facility.name}</Text>
                                        <Tag color="blue">{facility.sportName}</Tag>
                                    </Space>
                                }
                                description={
                                    <Space direction="vertical" size={8}>
                                        <div>
                                            <Rate disabled defaultValue={facility.rating} style={{ fontSize: 14 }} />
                                            <Text type="secondary" style={{ marginLeft: 8 }}>
                                                {facility.rating}
                                            </Text>
                                        </div>

                                        <div>
                                            <EnvironmentOutlined style={{ color: '#666', marginRight: 4 }} />
                                            <Text type="secondary">{facility.location}</Text>
                                        </div>

                                        <div>
                                            <ClockCircleOutlined style={{ color: '#666', marginRight: 4 }} />
                                            <Text type="secondary">{facility.openTime}</Text>
                                        </div>

                                        <div>
                                            <DollarOutlined style={{ color: '#666', marginRight: 4 }} />
                                            <Text strong style={{ color: '#1890ff' }}>
                                                {formatPrice(facility.price)}/giờ
                                            </Text>
                                        </div>

                                        <div style={{ marginTop: 8 }}>
                                            {facility.amenities.map((amenity, index) => (
                                                <Tag key={index} size="small" style={{ marginBottom: 4 }}>
                                                    {amenity}
                                                </Tag>
                                            ))}
                                        </div>
                                    </Space>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {filteredFacilities.length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Text type="secondary">Không tìm thấy sân phù hợp</Text>
                </div>
            )}
        </div>
    );
};

export default FacilitiesPage;