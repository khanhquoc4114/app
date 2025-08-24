import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getDistance } from 'geolib';
import { Row, Col, Card, Button, Typography, Tag, Rate, message, Breadcrumb } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, HomeOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const [facilities, setFacilities] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [facilitiesWithCoords, setFacilitiesWithCoords] = useState([]);
    const [coordsLoading, setCoordsLoading] = useState(false);
    const navigate = useNavigate();
    // Cache cho coordinates để tránh gọi API nhiều lần
    const [coordsCache, setCoordsCache] = useState(() => {
        const saved = localStorage.getItem('facilityCoordinatesCache');
        return saved ? JSON.parse(saved) : {};
    });

    // Lấy vị trí hiện tại của user bằng Geolocation API
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn('Không thể lấy vị trí:', error);
                    setUserLocation(null);
                }
            );
        }
    }, []);
    
    // Hàm lấy lat/lng từ địa chỉ bằng Nominatim (OpenStreetMap) với cache
    const getLatLngFromAddress = async (address) => {
        // Kiểm tra cache trước
        if (coordsCache[address]) {
            return coordsCache[address];
        }

        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        try {
            const response = await fetch(url, {
                headers: { 'User-Agent': 'sports-facility-frontend/1.0' }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                const coords = {
                    latitude: parseFloat(data[0].lat),
                    longitude: parseFloat(data[0].lon)
                };
                
                // Lưu vào cache
                const newCache = { ...coordsCache, [address]: coords };
                setCoordsCache(newCache);
                localStorage.setItem('facilityCoordinatesCache', JSON.stringify(newCache));
                
                return coords;
            }
        } catch (e) {
            console.error('Nominatim error:', e);
        }
        return null;
    };

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

    // Tự động lấy lat/lng từ location bằng Nominatim nếu chưa có (FIXED: không tạo vòng lặp)
    useEffect(() => {
        async function fetchLatLngForFacilities() {
            if (facilities.length === 0) return;
            
            setCoordsLoading(true);
            const facilitiesNeedingCoords = facilities.filter(f => 
                (!f.latitude || !f.longitude) && f.location && !coordsCache[f.location]
            );
            
            if (facilitiesNeedingCoords.length === 0) {
                // Tất cả facilities đã có coords hoặc đã cache
                const updated = facilities.map(facility => ({
                    ...facility,
                    ...coordsCache[facility.location]
                }));
                setFacilitiesWithCoords(updated);
                setCoordsLoading(false);
                return;
            }

            console.log(`Đang lấy tọa độ cho ${facilitiesNeedingCoords.length} địa điểm...`);
            
            // Gọi API từng cái một để tránh rate limit
            const updatedFacilities = [...facilities];
            for (let i = 0; i < facilitiesNeedingCoords.length; i++) {
                const facility = facilitiesNeedingCoords[i];
                const coords = await getLatLngFromAddress(facility.location);
                if (coords) {
                    const index = updatedFacilities.findIndex(f => f.id === facility.id);
                    if (index !== -1) {
                        updatedFacilities[index] = { ...updatedFacilities[index], ...coords };
                    }
                }
                // Delay nhỏ để tránh rate limit
                if (i < facilitiesNeedingCoords.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            setFacilitiesWithCoords(updatedFacilities);
            setCoordsLoading(false);
        }
        
        fetchLatLngForFacilities();
    }, [facilities.length]); // ✅ Chỉ phụ thuộc vào length, không phụ thuộc vào facilities

    // Tính khoảng cách với useMemo để tối ưu hiệu suất
    const facilitiesWithDistance = React.useMemo(() => {
        const baseFacilities = facilitiesWithCoords.length > 0 ? facilitiesWithCoords : facilities;
        
        if (!userLocation) return baseFacilities;
        
        return baseFacilities.map(facility => {
            if (facility.latitude && facility.longitude) {
                const distance = getDistance(
                    userLocation,
                    { latitude: facility.latitude, longitude: facility.longitude }
                );
                return { ...facility, distance };
            }
            return facility;
        });
    }, [facilitiesWithCoords, facilities, userLocation]);
    // Hàm hiển thị khoảng cách dạng "x.x km" hoặc "xxx m"
    const renderDistance = (distance) => {
        if (distance == null) return null;
        if (distance >= 1000) {
            return `${(distance / 1000).toFixed(1)} km`;
        }
        return `${distance} m`;
    };
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

    // Fetch facilities từ API
    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const res = await fetch(`${API_URL}/api/facilities`);
                const data = await res.json();
                
                const facilitiesWithSlots = data.map(facility => ({
                    ...facility,
                }));

                setFacilities(facilitiesWithSlots);
            } catch (err) {
                console.error("Lỗi fetch facilities:", err);
            }
        };

        fetchFacilities();
    }, [API_URL]);



    const filteredFacilities = facilitiesWithDistance.filter(facility => {
        const searchText = filters.searchText.toLowerCase();
        const safeLower = v => (typeof v === 'string' ? v.toLowerCase() : '');
        const matchesSearch = filters.searchText === '' ||
            safeLower(facility.name).includes(searchText) ||
            safeLower(facility.description).includes(searchText) ||
            safeLower(facility.location).includes(searchText) ||
            safeLower(facility.address).includes(searchText) ||
            safeLower(facility.district).includes(searchText) ||
            safeLower(facility.ward).includes(searchText) ||
            safeLower(facility.city).includes(searchText);

        const matchesSport = filters.sport === 'all' || facility.sport_type === filters.sport;

        const matchesLocation = filters.location === 'all' || 
            safeLower(facility.district).includes(safeLower(filters.location)) ||
            safeLower(facility.location).includes(safeLower(filters.location));

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
            onClick={() => navigate(`/facilities/${facility.id}`)}
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
                            {renderDistance(facility.distance)}
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
                        {Array.isArray(facility.sport_type)
                        ? facility.sport_type.map(type => (
                            <Tag color="blue" key={type}>{getSportName(type)}</Tag>
                            ))
                        : <Tag color="blue">{getSportName(facility.sport_type)}</Tag>
                        }
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

            {/* Coordinate Loading Indicator */}
            {coordsLoading && (
                <div style={{ 
                    background: '#e6f7ff', 
                    border: '1px solid #91d5ff',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #1890ff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <Text style={{ color: '#1890ff' }}>
                        Đang lấy tọa độ địa điểm để tính khoảng cách...
                    </Text>
                </div>
            )}

            {/* Facility Statistics */}
            <FacilityStats
                totalCount={allFacilitiesForDisplay.length}
                favoriteCount={favoriteFacilities.length}
                hasLocation={!!userLocation}
            />

            {/* All Facilities Section */}
            {/* Favorite Facilities Section */}
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

            {/* CSS for heart animation */}
            <style jsx={true}>{`
                @keyframes heartBounce {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .heart-bounce {
                    animation: heartBounce 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default FacilitiesPage;