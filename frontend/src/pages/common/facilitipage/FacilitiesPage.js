import React, { useState, useEffect, useCallback } from 'react';
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
    HomeOutlined,
    HeartOutlined,
    HeartFilled,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import AdvancedSearch from '../../../components/AdvancedSearch/AdvancedSearch';
import FacilityStats from '../../../components/FacilityStats/FacilityStats';

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
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const API_URL = process.env.REACT_APP_API_URL;

    const fetchFavorites = useCallback(async () => {
        const storedToken = localStorage.getItem("token");
        if (!storedToken) {
            setFavoritesLoading(false);
            return;
        }

        try {
            setFavoritesLoading(true);
            const res = await fetch(`${API_URL}/api/me/favorites`, {
                headers: {
                    "Authorization": `Bearer ${storedToken}`
                }
            });

            if (!res.ok) {
                console.error("API response not ok:", res.status, res.statusText);
                return;
            }

            const data = await res.json();
            console.log("Favorites API response:", data);
            
            let favoriteIds = [];
            if (Array.isArray(data)) {
                favoriteIds = data.map(f => f.facility_id || f.id || f);
            } else if (data.favorites && Array.isArray(data.favorites)) {
                favoriteIds = data.favorites.map(f => f.facility_id || f.id || f);
            }
            
            console.log("Processed favorite IDs:", favoriteIds);
            setFavorites(favoriteIds);
            
        } catch (err) {
            console.error("Error fetching favorites:", err);
        } finally {
            setFavoritesLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

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

    // Fetch facilities từ API
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch(`${API_URL}/api/facilities`);
                const data = await res.json();
                console.log("Facilities data:", data); // Debug log

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
    }, [API_URL]);

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

    // Fetch booked slots from database for specific facility and date
    const fetchBookedSlots = async (facilityId, date) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return {};

            const dateString = date.format('YYYY-MM-DD');
            const res = await fetch(`${API_URL}/api/bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) return {};
            const bookings = await res.json();

            // Filter bookings for this facility and date
            const facilityBookings = bookings.filter(booking => {
                const bookingDate = booking.start_time ? booking.start_time.split('T')[0] : '';
                return booking.facility_id === facilityId && bookingDate === dateString;
            });

            // Mark booked time slots
            const booked = {};
            facilityBookings.forEach(booking => {
                const startTime = new Date(booking.start_time);
                const endTime = new Date(booking.end_time);
                for (let hour = startTime.getHours(); hour < endTime.getHours(); hour++) {
                    const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
                    booked[timeSlot] = true;
                }
            });
            return booked;
        } catch (error) {
            return {};
        }
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

    // Filter facilities
    const filteredFacilities = facilities.filter(facility => {
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
        const aIsFavorite = favorites.includes(a.id);
        const bIsFavorite = favorites.includes(b.id);

        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;

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

    // Separate favorites for display - FIXED
    const favoriteFacilities = filteredFacilities.filter(facility => {
        console.log(`Checking facility ${facility.id} (${facility.name}):`, {
            facilityId: facility.id,
            favoriteIds: favorites,
            isIncluded: favorites.includes(facility.id)
        });
        return favorites.includes(facility.id);
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

    const handleBookFacility = async (facility) => {
        setSelectedFacility(facility);
        setBookingModalVisible(true);

        // Fetch real booked slots from database
        const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;
        if (!bookedSlots[facilityDateKey]) {
            const bookedSlotsFromDB = await fetchBookedSlots(facility.id, selectedDate);
            setBookedSlots(prev => ({
                ...prev,
                [facilityDateKey]: bookedSlotsFromDB
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

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setSelectedTimeSlots([]); // Clear selected slots when date changes

        // Fetch real booked slots for new date if not exists
        if (selectedFacility) {
            const facilityDateKey = `${selectedFacility.id}_${date.format('YYYY-MM-DD')}`;
            if (!bookedSlots[facilityDateKey]) {
                const bookedSlotsFromDB = await fetchBookedSlots(selectedFacility.id, date);
                setBookedSlots(prev => ({
                    ...prev,
                    [facilityDateKey]: bookedSlotsFromDB
                }));
            }
        }
    };

    // Fixed toggle favorite function
const handleToggleFavorite = async (facilityId, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
        message.error("Bạn cần đăng nhập để dùng tính năng này");
        return;
    }

    const isFavorited = favorites.includes(facilityId);
    console.log("Toggling favorite for facility:", facilityId, "Currently favorited:", isFavorited);

    try {
        const method = isFavorited ? "DELETE" : "POST";
        const res = await fetch(`${API_URL}/api/facilities/${facilityId}/favorite`, {
            method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`${method} favorite failed:`, res.status, errorText);
            throw new Error(isFavorited ? "Không thể bỏ thích" : "Không thể thêm thích");
        }

        const responseData = await res.json();
        console.log(`${method} favorite success:`, responseData);
        
        // Refresh favorites from server instead of manual state update
        await fetchFavorites();
        
        message.success(isFavorited ? "Đã bỏ khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích");

    } catch (error) {
        console.error("Favorite toggle error:", error);
        message.error("Có lỗi xảy ra, thử lại sau");
    }
};

    const handleBookingSubmit = async () => {
        if (!selectedTimeSlots.length) {
            message.error('Vui lòng chọn ít nhất một khung giờ');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            message.error('Vui lòng đăng nhập để đặt sân');
            return;
        }

        // Determine start and end time
        const sortedSlots = selectedTimeSlots.sort();
        const startHour = parseInt(sortedSlots[0].split(':')[0]);
        const endHour = parseInt(sortedSlots[sortedSlots.length - 1].split(':')[0]) + 1;

        const startTime = selectedDate.clone().hour(startHour).minute(0).second(0).millisecond(0);
        const endTime = selectedDate.clone().hour(endHour).minute(0).second(0).millisecond(0);

        // Booking data
        const bookingData = {
            facility_id: selectedFacility.id,
            booking_date: selectedDate.format('YYYY-MM-DDT00:00:00'),
            start_time: startTime.format('YYYY-MM-DDTHH:mm:ss'),
            end_time: endTime.format('YYYY-MM-DDTHH:mm:ss'),
            time_slots: selectedTimeSlots,
            total_price: selectedTimeSlots.length * selectedFacility.price_per_hour,
            notes: `Đặt sân ${selectedFacility.name} - ${sortedSlots.join(', ')}`
        };

        try {
            const response = await fetch(`${API_URL}/api/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            if (!response.ok) {
                throw new Error('Có lỗi xảy ra khi đặt sân');
            }

            const result = await response.json();
            message.success(`Đặt sân thành công! Mã đặt: ${result.booking_id}`);
            setBookingModalVisible(false);
            setSelectedTimeSlots([]);

        } catch (err) {
            message.error(err.message || 'Có lỗi xảy ra');
        }
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
                flexDirection: 'column',
                body: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '12px',
                },
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

    console.log("Current state:", { // Debug log for render
        favoritesLoading,
        favorites,
        facilitiesCount: facilities.length,
        favoriteFacilitiesCount: favoriteFacilities.length
    });

    return (
        <div>
            {/* Breadcrumb */}
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item href="/home">
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
                key={filters.sport}
                initialFilters={filters}
                facilities={facilities}
                onFilterChange={setFilters}
                onSearch={(searchFilters) => {
                    setFilters(searchFilters);
                    message.success(`Tìm thấy ${filteredFacilities.length} sân phù hợp`);
                }}
            />

            {/* Facility Statistics */}
            <FacilityStats
                totalCount={filteredFacilities.length}
                favoriteCount={favoriteFacilities.length}
                hasLocation={!!userLocation}
                onResetLocation={() => {
                    // Clear localStorage and reset states
                    setUserLocation(null);
                    // Reset sort to default
                    setFilters(prev => ({
                        ...prev,
                        sortBy: 'name'
                    }));
                }}
            />

            {/* Favorite Facilities Section - FIXED */}
            {!favoritesLoading && favoriteFacilities.length > 0 && (
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

            {/* Loading state for favorites */}
            {favoritesLoading && (
                <div style={{ marginBottom: 32, textAlign: 'center', padding: 20 }}>
                    <Text type="secondary">Đang tải danh sách yêu thích...</Text>
                </div>
            )}

            {/* All Facilities Section */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4}>
                    🏟️ {filters.sport !== 'all' ? `Tất cả sân ${getSportName(filters.sport).toLowerCase()}` : 'Tất cả sân thể thao'}
                </Title>
                <Text type="secondary">
                    {filteredFacilities.length} sân có sẵn
                    {favorites.length > 0 && ' • Sân yêu thích được ưu tiên hiển thị đầu tiên'}
                </Text>
            </div>

            {/* Facilities grid */}
            <Row gutter={[12, 12]}>
                {filteredFacilities.map(facility => (
                    <Col xs={24} sm={12} md={8} lg={6} key={facility.id}>
                        {renderFacilityCard(facility, userLocation && facility.distance, false)}
                    </Col>
                ))}
            </Row>

            {/* Empty state */}
            {!favoritesLoading && filteredFacilities.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <Text type="secondary">Không tìm thấy sân nào phù hợp với tiêu chí tìm kiếm</Text>
                </div>
            )}

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
                                        // Get booked status from state
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
            <style jsx={true}>{`
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