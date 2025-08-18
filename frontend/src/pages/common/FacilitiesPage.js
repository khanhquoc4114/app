import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Rate,
    Modal,
    Form,
    DatePicker,
    message,
    Breadcrumb
} from 'antd';
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    HomeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const FacilitiesPage = () => {
    const location = useLocation();
    const [filters, setFilters] = useState({
        searchText: '',
        sport: 'all',
        priceRange: [0, 500000],
        location: 'all',
        rating: 0,
        amenities: [],
        availability: 'all',
        sortBy: 'name'
    });
    const [bookingModalVisible, setBookingModalVisible] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState({});
    const [facilities, setFacilities] = useState([]);

    // Handle URL query parameters
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const sportParam = searchParams.get('sport');

        if (sportParam) {
            setFilters(prev => ({
                ...prev,
                sport: sportParam
            }));
        }
    }, [location.search]);

    // Generate time slots based on opening hours
    const generateTimeSlots = (openingHours) => {
        const [startTime, endTime] = openingHours.split(' - ');
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);

        const slots = [];
        for (let hour = startHour; hour <= endHour; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    // Mock data
    // const facilities = [
    //     {
    //         id: 1,
    //         name: 'Sân cầu lông VIP 1',
    //         sport_type: 'badminton',
    //         description: 'Sân cầu lông chất lượng cao với sàn gỗ chuyên nghiệp, hệ thống chiếu sáng LED hiện đại',
    //         price_per_hour: 80000,
    //         image_url: '/images/badminton-1.jpg',
    //         location: 'Quận 1, TP.HCM',
    //         rating: 4.8,
    //         reviews_count: 124,
    //         amenities: ['Điều hòa', 'Wifi', 'Bãi đỗ xe', 'Phòng thay đồ'],
    //         opening_hours: '06:00 - 22:00'
    //     },
    //     {
    //         id: 2,
    //         name: 'Sân bóng đá mini A',
    //         sport_type: 'football',
    //         description: 'Sân bóng đá mini 5v5 với cỏ nhân tạo cao cấp, hệ thống tưới nước tự động',
    //         price_per_hour: 200000,
    //         image_url: '/images/football-1.jpg',
    //         location: 'Quận 7, TP.HCM',
    //         rating: 4.6,
    //         reviews_count: 89,
    //         amenities: ['Điều hòa phòng chờ', 'Bãi đỗ xe', 'Phòng thay đồ', 'Căng tin'],
    //         opening_hours: '05:00 - 23:00'
    //     },
    //     {
    //         id: 3,
    //         name: 'Sân tennis cao cấp',
    //         sport_type: 'tennis',
    //         description: 'Sân tennis tiêu chuẩn quốc tế với mặt sân hard court, lưới chuyên nghiệp',
    //         price_per_hour: 150000,
    //         image_url: '/images/tennis-1.jpg',
    //         location: 'Quận 3, TP.HCM',
    //         rating: 4.9,
    //         reviews_count: 156,
    //         amenities: ['Điều hòa', 'Wifi', 'Bãi đỗ xe', 'Phòng thay đồ', 'Thuê vợt'],
    //         opening_hours: '06:00 - 21:00'
    //     },
    //     {
    //         id: 4,
    //         name: 'Sân bóng rổ trong nhà',
    //         sport_type: 'basketball',
    //         description: 'Sân bóng rổ trong nhà với sàn gỗ chuyên nghiệp, rổ chuẩn NBA',
    //         price_per_hour: 120000,
    //         image_url: '/images/basketball-1.jpg',
    //         location: 'Quận 10, TP.HCM',
    //         rating: 4.7,
    //         reviews_count: 78,
    //         amenities: ['Điều hòa', 'Âm thanh', 'Bãi đỗ xe', 'Phòng thay đồ'],
    //         opening_hours: '06:00 - 22:00'
    //     }
    // ].map(facility => ({
    //     ...facility,
    //     available_slots: generateTimeSlots(facility.opening_hours)
    // }));

    // Fetch facilities từ API
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/facilities");
                const data = await res.json();

                const facilitiesWithSlots = data.map(facility => ({
                    ...facility,
                    available_slots: generateTimeSlots(facility.opening_hours)
                }));

                setFacilities(facilitiesWithSlots);
            } catch (err) {
                console.error("Lỗi fetch facilities:", err);
            }
        };

        fetchFacilities();
    }, []);

    const sportTypes = [
        { value: 'all', label: 'Tất cả' },
        { value: 'badminton', label: 'Cầu lông' },
        { value: 'football', label: 'Bóng đá' },
        { value: 'tennis', label: 'Tennis' },
        { value: 'basketball', label: 'Bóng rổ' }
    ];

    const timeSlots = [
        '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
    ];

    const filteredFacilities = facilities.filter(facility => {
        const matchesSearch = filters.searchText === '' ||
            facility.name.toLowerCase().includes(filters.searchText.toLowerCase()) ||
            facility.description.toLowerCase().includes(filters.searchText.toLowerCase());

        const matchesSport = filters.sport === 'all' || facility.sport_type === filters.sport;

        const matchesPrice = facility.price_per_hour >= filters.priceRange[0] &&
            facility.price_per_hour <= filters.priceRange[1];

        const matchesRating = filters.rating === 0 || facility.rating >= filters.rating;

        const matchesAmenities = filters.amenities.length === 0 ||
            filters.amenities.every(amenity => {
                const amenityMap = {
                    'parking': 'Bãi đỗ xe',
                    'ac': 'Điều hòa',
                    'wifi': 'Wifi',
                    'shower': 'Phòng thay đồ',
                    'canteen': 'Căng tin',
                    'equipment': 'Thuê vợt'
                };
                return facility.amenities?.includes(amenityMap[amenity]);
            });

        return matchesSearch && matchesSport && matchesPrice && matchesRating && matchesAmenities;
    }).sort((a, b) => {
        switch (filters.sortBy) {
            case 'price_asc':
                return a.price_per_hour - b.price_per_hour;
            case 'price_desc':
                return b.price_per_hour - a.price_per_hour;
            case 'rating':
                return b.rating - a.rating;
            case 'name':
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const getSportIcon = (sportType) => {
        const icons = {
            badminton: '🏸',
            football: '⚽',
            tennis: '🎾',
            basketball: '🏀'
        };
        return icons[sportType] || '🏃';
    };

    const getSportName = (sportType) => {
        const names = {
            badminton: 'Cầu lông',
            football: 'Bóng đá',
            tennis: 'Tennis',
            basketball: 'Bóng rổ'
        };
        return names[sportType] || sportType;
    };

    const handleBookFacility = (facility) => {
        setSelectedFacility(facility);
        setBookingModalVisible(true);

        // Generate fixed booked slots for this facility and date (mock data)
        const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;
        if (!bookedSlots[facilityDateKey]) {
            const newBookedSlots = {};
            facility.available_slots.forEach(slot => {
                // Mock: randomly mark some slots as booked (but fixed for this session)
                newBookedSlots[slot] = Math.random() < 0.3; // 30% chance
            });
            setBookedSlots(prev => ({
                ...prev,
                [facilityDateKey]: newBookedSlots
            }));
        }
    };

    const handleTimeSlotChange = (timeSlot) => {
        setSelectedTimeSlots(prev => {
            if (prev.includes(timeSlot)) {
                return prev.filter(slot => slot !== timeSlot);
            } else {
                return [...prev, timeSlot];
            }
        });
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setSelectedTimeSlots([]); // Clear selected slots when date changes

        // Generate booked slots for new date if not exists
        if (selectedFacility) {
            const facilityDateKey = `${selectedFacility.id}_${date.format('YYYY-MM-DD')}`;
            if (!bookedSlots[facilityDateKey]) {
                const newBookedSlots = {};
                selectedFacility.available_slots.forEach(slot => {
                    // Mock: randomly mark some slots as booked (but fixed for this session)
                    newBookedSlots[slot] = Math.random() < 0.3; // 30% chance
                });
                setBookedSlots(prev => ({
                    ...prev,
                    [facilityDateKey]: newBookedSlots
                }));
            }
        }
    };

    const handleBookingSubmit = () => {
        if (selectedTimeSlots.length === 0) {
            message.error('Vui lòng chọn ít nhất một khung giờ');
            return;
        }

        const totalAmount = selectedTimeSlots.length * selectedFacility.price_per_hour;
        message.success(`Đặt sân thành công! Tổng tiền: ${new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(totalAmount)}`);

        setBookingModalVisible(false);
        setSelectedTimeSlots([]);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getShortAmenityName = (amenity) => {
        const shortNames = {
            'Điều hòa': 'AC',
            'Điều hòa phòng chờ': 'AC',
            'Wifi': 'WiFi',
            'Bãi đỗ xe': 'Parking',
            'Phòng thay đồ': 'Thay đồ',
            'Căng tin': 'Căng tin',
            'Thuê vợt': 'Thuê vợt',
            'Âm thanh': 'Audio',
            'Phòng tắm': 'WC',
            'Tủ khóa': 'Locker'
        };
        return shortNames[amenity] || amenity;
    };

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                    <span>Trang chủ</span>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    {filters.sport !== 'all' ?
                        `Sân ${getSportName(filters.sport)}` :
                        'Danh sách sân'
                    }
                </Breadcrumb.Item>
            </Breadcrumb>

            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    {filters.sport !== 'all' ?
                        `Sân ${getSportName(filters.sport)}` :
                        'Danh sách sân thể thao'
                    }
                </Title>
                <Text type="secondary">
                    {filters.sport !== 'all' ?
                        `Tìm và đặt sân ${getSportName(filters.sport).toLowerCase()} phù hợp với bạn` :
                        'Tìm và đặt sân thể thao phù hợp với bạn'
                    }
                </Text>
            </div>

            {/* Advanced Search */}
            <AdvancedSearch
                key={filters.sport} // Force re-render when sport changes
                initialFilters={filters}
                onFilterChange={setFilters}
                onSearch={(searchFilters) => {
                    setFilters(searchFilters);
                    message.success(`Tìm thấy ${filteredFacilities.length} sân phù hợp`);
                }}
            />

            {/* Results count */}
            <div style={{ marginBottom: 16 }}>
                <Text type="secondary">
                    Tìm thấy {filteredFacilities.length} sân phù hợp
                </Text>
            </div>

            {/* Facilities grid */}
            <Row gutter={[12, 12]}>
                {filteredFacilities.map(facility => (
                    <Col xs={24} sm={12} md={8} lg={6} key={facility.id}>
                        <Card
                            hoverable
                            onClick={() => handleBookFacility(facility)}
                            style={{
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                border: '2px solid transparent',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            bodyStyle={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '12px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#1890ff';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(24, 144, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                            }}
                            cover={
                                <div style={{
                                    height: 140,
                                    background: 'linear-gradient(45deg, #f0f2f5, #d9d9d9)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '32px'
                                }}>
                                    {getSportIcon(facility.sport_type)}
                                </div>
                            }
                        >
                            <Meta
                                title={
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: 4 }}>
                                            {facility.name}
                                        </div>
                                        <Tag color="blue" size="small" style={{ fontSize: '10px' }}>
                                            {getSportName(facility.sport_type)}
                                        </Tag>
                                    </div>
                                }
                                description={
                                    <div>
                                        <Paragraph
                                            ellipsis={{ rows: 2 }}
                                            style={{
                                                marginBottom: 6,
                                                minHeight: 32,
                                                fontSize: '12px',
                                                lineHeight: '1.3'
                                            }}
                                        >
                                            {facility.description}
                                        </Paragraph>

                                        <div style={{ marginBottom: 4 }}>
                                            <EnvironmentOutlined style={{ marginRight: 4, fontSize: '12px' }} />
                                            <Text type="secondary" style={{ fontSize: '11px' }}>{facility.location}</Text>
                                        </div>

                                        <div style={{ marginBottom: 4 }}>
                                            <ClockCircleOutlined style={{ marginRight: 4, fontSize: '12px' }} />
                                            <Text type="secondary" style={{ fontSize: '11px' }}>{facility.opening_hours}</Text>
                                        </div>

                                        <div style={{ marginBottom: 4 }}>
                                            <Rate disabled defaultValue={facility.rating} style={{ fontSize: '12px' }} />
                                            <Text type="secondary" style={{ marginLeft: 6, fontSize: '11px' }}>
                                                {facility.rating} ({facility.reviews_count})
                                            </Text>
                                        </div>

                                        <div style={{ marginBottom: 6 }}>
                                            <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                                                {formatPrice(facility.price_per_hour)}/giờ
                                            </Text>
                                        </div>

                                        <div style={{
                                            marginTop: 'auto',
                                            paddingTop: 4,
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: 3,
                                            minHeight: 24
                                        }}>
                                            {facility.amenities.slice(0, 3).map(amenity => (
                                                <Tag
                                                    key={amenity}
                                                    size="small"
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '1px 4px',
                                                        margin: 0,
                                                        borderRadius: '8px',
                                                        lineHeight: '1.2'
                                                    }}
                                                >
                                                    {getShortAmenityName(amenity)}
                                                </Tag>
                                            ))}
                                            {facility.amenities.length > 3 && (
                                                <Tag
                                                    size="small"
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '1px 4px',
                                                        margin: 0,
                                                        borderRadius: '8px',
                                                        backgroundColor: '#f0f0f0',
                                                        color: '#666',
                                                        lineHeight: '1.2'
                                                    }}
                                                >
                                                    +{facility.amenities.length - 3}
                                                </Tag>
                                            )}
                                        </div>


                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Booking Modal */}
            <Modal
                title={`Đặt sân: ${selectedFacility?.name}`}
                open={bookingModalVisible}
                onCancel={() => {
                    setBookingModalVisible(false);
                    setSelectedTimeSlots([]);
                }}
                footer={null}
                width={600}
            >
                {selectedFacility && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Thông tin sân:</Text>
                            <div style={{ marginTop: 8 }}>
                                <div>📍 {selectedFacility.location}</div>
                                <div>🕐 {selectedFacility.opening_hours}</div>
                                <div>💰 {formatPrice(selectedFacility.price_per_hour)}/giờ</div>
                            </div>
                        </div>

                        <Form layout="vertical">
                            <Form.Item label="Chọn ngày" required>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    style={{ width: '100%' }}
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                />
                            </Form.Item>

                            <Form.Item label="Chọn khung giờ" required>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                    {selectedFacility.available_slots.map(slot => {
                                        // Get booked status from state (fixed for session)
                                        const facilityDateKey = `${selectedFacility.id}_${selectedDate.format('YYYY-MM-DD')}`;
                                        const isBooked = bookedSlots[facilityDateKey]?.[slot] || false;
                                        const isSelected = selectedTimeSlots.includes(slot);
                                        const isPastTime = selectedDate.isSame(dayjs(), 'day') &&
                                            parseInt(slot.split(':')[0]) <= dayjs().hour();

                                        return (
                                            <Button
                                                key={slot}
                                                type={isSelected ? 'primary' : 'default'}
                                                disabled={isBooked || isPastTime}
                                                onClick={() => handleTimeSlotChange(slot)}
                                                style={{
                                                    textAlign: 'center',
                                                    backgroundColor: isBooked ? '#f5f5f5' : undefined,
                                                    borderColor: isBooked ? '#d9d9d9' : undefined,
                                                    color: isBooked ? '#999' : undefined
                                                }}
                                            >
                                                <div>{slot}</div>
                                                {isBooked && (
                                                    <div style={{ fontSize: '10px', color: '#ff4d4f' }}>
                                                        Đã đặt
                                                    </div>
                                                )}
                                                {isPastTime && !isBooked && (
                                                    <div style={{ fontSize: '10px', color: '#999' }}>
                                                        Đã qua
                                                    </div>
                                                )}
                                            </Button>
                                        );
                                    })}
                                </div>
                                <div style={{ marginTop: 12 }}>
                                    <Space direction="vertical" size={4}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            💡 Có thể chọn nhiều khung giờ liên tiếp
                                        </Text>
                                        <Space size={16}>
                                            <Space size={4}>
                                                <div style={{
                                                    width: 12,
                                                    height: 12,
                                                    backgroundColor: '#1890ff',
                                                    borderRadius: 2
                                                }} />
                                                <Text style={{ fontSize: '11px' }}>Đã chọn</Text>
                                            </Space>
                                            <Space size={4}>
                                                <div style={{
                                                    width: 12,
                                                    height: 12,
                                                    backgroundColor: '#f5f5f5',
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 2
                                                }} />
                                                <Text style={{ fontSize: '11px' }}>Đã đặt</Text>
                                            </Space>
                                            <Space size={4}>
                                                <div style={{
                                                    width: 12,
                                                    height: 12,
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 2
                                                }} />
                                                <Text style={{ fontSize: '11px' }}>Còn trống</Text>
                                            </Space>
                                        </Space>
                                    </Space>
                                </div>
                            </Form.Item>

                            {selectedTimeSlots.length > 0 && (
                                <Form.Item label="Tổng kết">
                                    <div style={{ background: '#f6f6f6', padding: 16, borderRadius: 6 }}>
                                        <div>Ngày: {selectedDate.format('DD/MM/YYYY')}</div>
                                        <div>Khung giờ: {selectedTimeSlots.sort().join(', ')}</div>
                                        <div>Số giờ: {selectedTimeSlots.length} giờ</div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                                            Tổng tiền: {formatPrice(selectedTimeSlots.length * selectedFacility.price_per_hour)}
                                        </div>
                                    </div>
                                </Form.Item>
                            )}

                            <Form.Item>
                                <Space>
                                    <Button type="primary" onClick={handleBookingSubmit}>
                                        Xác nhận đặt sân
                                    </Button>
                                    <Button onClick={() => {
                                        setBookingModalVisible(false);
                                        setSelectedTimeSlots([]);
                                    }}>
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default FacilitiesPage;