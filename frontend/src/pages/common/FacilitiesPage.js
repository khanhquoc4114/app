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
    HomeOutlined,
    HeartOutlined,
    HeartFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import AdvancedSearch from '../../components/AdvancedSearch/AdvancedSearch';
import axios from 'axios';
import FacilityStats from '../../components/FacilityStats/FacilityStats';

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
    const [favorites, setFavorites] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [favoritesLoaded, setFavoritesLoaded] = useState(false);
    const API_URL = process.env.REACT_APP_API_URL;
    const facilitiesWithDistance = facilities;
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

    // Load favorites from localStorage
    useEffect(() => {
        const savedFavorites = localStorage.getItem('facilityFavorites');
        if (savedFavorites) {
            try {
                const parsedFavorites = JSON.parse(savedFavorites);
                console.log('Loaded favorites from localStorage:', parsedFavorites);
                setFavorites(parsedFavorites);
            } catch (error) {
                console.error('Error parsing favorites from localStorage:', error);
                localStorage.removeItem('facilityFavorites');
            }
        }
        setFavoritesLoaded(true);
    }, []);


    // Save favorites to localStorage whenever favorites change (but only after initial load)
    useEffect(() => {
        if (favoritesLoaded) {
            localStorage.setItem('facilityFavorites', JSON.stringify(favorites));
            console.log('Saved favorites to localStorage:', favorites);
        }
    }, [favorites, favoritesLoaded]);

    // Open Google Maps with directions from user location to facility
    const openGoogleMaps = (facility) => {
        console.log('Opening Google Maps for:', facility.name); // Debug log
        const destination = encodeURIComponent(facility.location);
        let url;
        
        if (userLocation) {
            // If we have user location, show directions
            url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${destination}`;
            console.log('With user location:', url);
        } else {
            // If no user location, just show the facility on map
            url = `https://www.google.com/maps/search/${destination}`;
            console.log('Without user location:', url);
        }
        
        window.open(url, '_blank');
    };

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

    // Fetch facilities từ API
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch(`${API_URL}/api/facilities`);
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

    const filteredFacilities = facilitiesWithDistance.filter(facility => {
        const searchText = filters.searchText.toLowerCase();
        const matchesSearch = filters.searchText === '' ||
            facility.name.toLowerCase().includes(searchText) ||
            facility.description.toLowerCase().includes(searchText) ||
            facility.location.toLowerCase().includes(searchText) ||
            facility.address.toLowerCase().includes(searchText) ||
            facility.district.toLowerCase().includes(searchText) ||
            facility.ward.toLowerCase().includes(searchText) ||
            facility.city.toLowerCase().includes(searchText);

        const matchesSport = filters.sport === 'all' || facility.sport_type === filters.sport;

        const matchesLocation = filters.location === 'all' || 
            facility.district.toLowerCase().includes(filters.location.toLowerCase()) ||
            facility.location.toLowerCase().includes(filters.location.toLowerCase());

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

        return matchesSearch && matchesSport && matchesLocation && matchesPrice && matchesRating && matchesAmenities;
    }).sort((a, b) => {
        // Priority 1: Favorites always first (regardless of sort option)
        const aIsFavorite = favorites.includes(a.id);
        const bIsFavorite = favorites.includes(b.id);

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;

        // Priority 2: Sort by selected criteria
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

    // Separate favorites for display (remove nearby logic)
    const favoriteFacilities = filteredFacilities.filter(f => favorites.includes(f.id));
    const allFacilitiesForDisplay = filteredFacilities;

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

    const handleToggleFavorite = (facilityId, e) => {
        e.stopPropagation(); // Prevent card click

        setFavorites(prev => {
            const isFavorited = prev.includes(facilityId);
            let newFavorites;

            if (isFavorited) {
                newFavorites = prev.filter(id => id !== facilityId);
                message.success('Đã bỏ khỏi danh sách yêu thích');
            } else {
                newFavorites = [...prev, facilityId];
                message.success('Đã thêm vào danh sách yêu thích');
            }

            console.log('Updated favorites:', newFavorites);
            return newFavorites;
        });
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

    const renderFacilityCard = (facility, showDistance = false, isFavoriteSection = false) => (
        <Card
            hoverable
            onClick={() => handleBookFacility(facility)}
            style={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: favorites.includes(facility.id) ? '2px solid #ff4d4f' : '2px solid transparent',
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
                e.currentTarget.style.borderColor = favorites.includes(facility.id) ? '#ff4d4f' : '#1890ff';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(24, 144, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = favorites.includes(facility.id) ? '#ff4d4f' : 'transparent';
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
                    fontSize: '32px',
                    position: 'relative'
                }}>
                    {getSportIcon(facility.sport_type)}

                    {/* Distance badge */}
                    {showDistance && facility.distance && (
                        <div style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: 'rgba(24, 144, 255, 0.9)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}>
                            Xem trên bản đồ
                        </div>
                    )}

                    {/* Favorite badge */}
                    {isFavoriteSection && (
                        <div style={{
                            position: 'absolute',
                            top: 8,
                            left: showDistance && facility.distance ? 60 : 8,
                            background: 'rgba(255, 77, 79, 0.9)',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}>
                            ⭐ Yêu thích
                        </div>
                    )}

                    {/* Heart Icon */}
                    <Button
                        type="text"
                        shape="circle"
                        size="small"
                        icon={favorites.includes(facility.id) ?
                            <HeartFilled style={{ color: '#ff4d4f', fontSize: '18px' }} /> :
                            <HeartOutlined style={{ color: '#fff', fontSize: '18px' }} />
                        }
                        onClick={(e) => handleToggleFavorite(facility.id, e)}
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            border: 'none',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.3s ease',
                            zIndex: 2
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                        }}
                    />

                    {/* Google Maps Button */}
                    <Button
                        shape="circle"
                        size="small"
                        icon={<EnvironmentOutlined style={{ color: '#fff', fontSize: '16px' }} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            openGoogleMaps(facility);
                        }}
                        style={{
                            position: 'absolute',
                            top: 50,
                            right: 8,
                            backgroundColor: '#52c41a',
                            border: '2px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease',
                            zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.2)';
                            e.currentTarget.style.backgroundColor = '#389e0d';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.backgroundColor = '#52c41a';
                        }}
                    />
                </div>
            }
        >
            <Meta
                title={
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: 4 }}>
                            {facility.name}
                            {favorites.includes(facility.id) && (
                                <HeartFilled style={{ color: '#ff4d4f', marginLeft: 4, fontSize: '12px' }} />
                            )}
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
                            <Text type="secondary" style={{ fontSize: '11px' }}>
                                {facility.location}
                            </Text>
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
    );

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
                facilities={facilities}
                onFilterChange={setFilters}
                onSearch={(searchFilters) => {
                    setFilters(searchFilters);
                    message.success(`Tìm thấy ${filteredFacilities.length} sân phù hợp`);
                }}
            />

            {/* Location Banner - only show when needed and not dismissed */}


            {/* Facility Statistics */}
            <FacilityStats
                totalCount={allFacilitiesForDisplay.length}
                favoriteCount={favoriteFacilities.length}
                hasLocation={!!userLocation}
                onResetLocation={() => {
                    // Clear localStorage

                    // Reset states
                    setUserLocation(null);

                    // Reset sort to default
                    setFilters(prev => ({
                        ...prev,
                        sortBy: 'name'
                    }));
                }}
            />

            {/* All Facilities Section */}
            {/* Favorite Facilities Section */}
            {favoriteFacilities.length > 0 && (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Title level={4} style={{ color: '#ff4d4f' }}>
                            ⭐ Sân yêu thích của bạn
                        </Title>
                        <Text type="secondary">
                            {favoriteFacilities.length} sân đã lưu • Luôn hiển thị đầu tiên trong danh sách
                        </Text>
                    </div>
                    <Row gutter={[12, 12]} style={{ marginBottom: 32 }}>
                        {favoriteFacilities.map(facility => (
                            <Col xs={24} sm={12} md={8} lg={6} key={`favorite-${facility.id}`}>
                                {renderFacilityCard(facility, userLocation && facility.distance, true)}
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* All Facilities Section */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4}>
                    🏟️ {filters.sport !== 'all' ? `Tất cả sân ${getSportName(filters.sport).toLowerCase()}` : 'Tất cả sân thể thao'}
                </Title>
                <Text type="secondary">
                    {allFacilitiesForDisplay.length} sân có sẵn
                    {favorites.length > 0 && ' • Sân yêu thích được ưu tiên hiển thị đầu tiên'}
                </Text>
            </div>

            {/* Facilities grid */}
            <Row gutter={[12, 12]}>
                {allFacilitiesForDisplay.map(facility => (
                    <Col xs={24} sm={12} md={8} lg={6} key={facility.id}>
                        {renderFacilityCard(facility, userLocation && facility.distance, false)}
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

            {/* CSS for heart animation */}
            <style jsx>{`
                @keyframes heartBounce {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                
                .heart-bounce {
                    animation: heartBounce 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default FacilitiesPage;