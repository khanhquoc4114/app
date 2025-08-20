// UI component for FacilitiesPage
import React from 'react';
import { Row, Col, Typography, Breadcrumb, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import AdvancedSearch from '../../../components/AdvancedSearch/AdvancedSearch';
import FacilityStats from '../../../components/FacilityStats/FacilityStats';
import FacilityCard from './components/FacilityCard';
import BookingModal from './components/BookingModal';
import FacilityHelper from './FacilitiesPageClass';

const { Title, Text } = Typography;

const FacilitiesPageUI = (props) => {
    const {
        filters,
        setFilters,
        bookingModalVisible,
        setBookingModalVisible,
        selectedFacility,
        selectedDate,
        selectedTimeSlots,
        bookedSlots,
        facilities,
        favorites,
        userLocation,
        setUserLocation,
        filteredFacilities,
        favoriteFacilities,
        openGoogleMaps,
        handleBookFacility,
        handleTimeSlotChange,
        handleDateChange,
        handleToggleFavorite,
        handleBookingSubmit,
        sportTypes
    } = props;

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
                        `Sân ${FacilityHelper.getSportName(filters.sport)}` :
                        'Danh sách sân'
                    }
                </Breadcrumb.Item>
            </Breadcrumb>

            <div style={{ marginBottom: 24 }}>
                <Title level={2}>
                    {filters.sport !== 'all' ?
                        `Sân ${FacilityHelper.getSportName(filters.sport)}` :
                        'Danh sách sân thể thao'
                    }
                </Title>
                <Text type="secondary">
                    {filters.sport !== 'all' ?
                        `Tìm và đặt sân ${FacilityHelper.getSportName(filters.sport).toLowerCase()} phù hợp với bạn` :
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
                    setUserLocation(null);
                    setFilters(prev => ({ ...prev, sortBy: 'name' }));
                }}
            />

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
                                <FacilityCard
                                    facility={facility}
                                    favorites={favorites}
                                    userLocation={userLocation}
                                    showDistance={userLocation && facility.distance}
                                    isFavoriteSection={true}
                                    onToggleFavorite={handleToggleFavorite}
                                    onBookFacility={handleBookFacility}
                                    onOpenGoogleMaps={openGoogleMaps}
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}

            {/* All Facilities Section */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4}>
                    🏟️ {filters.sport !== 'all' ? `Tất cả sân ${FacilityHelper.getSportName(filters.sport).toLowerCase()}` : 'Tất cả sân thể thao'}
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
                        <FacilityCard
                            facility={facility}
                            favorites={favorites}
                            userLocation={userLocation}
                            showDistance={userLocation && facility.distance}
                            isFavoriteSection={false}
                            onToggleFavorite={handleToggleFavorite}
                            onBookFacility={handleBookFacility}
                            onOpenGoogleMaps={openGoogleMaps}
                        />
                    </Col>
                ))}
            </Row>

            {/* Booking Modal */}
            <BookingModal
                visible={bookingModalVisible}
                onCancel={() => {
                    setBookingModalVisible(false);
                }}
                facility={selectedFacility}
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                selectedTimeSlots={selectedTimeSlots}
                onTimeSlotChange={handleTimeSlotChange}
                bookedSlots={bookedSlots}
                onBookingSubmit={handleBookingSubmit}
            />

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

export default FacilitiesPageUI;
