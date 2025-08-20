import React from 'react';
import { Card, Button, Typography, Tag, Rate, Space } from 'antd';
import {
    EnvironmentOutlined,
    ClockCircleOutlined,
    HeartOutlined,
    HeartFilled
} from '@ant-design/icons';
import FacilityHelper from '../FacilitiesPageClass';

const { Text, Paragraph } = Typography;
const { Meta } = Card;

const FacilityCard = ({
    facility,
    favorites,
    userLocation,
    showDistance = false,
    isFavoriteSection = false,
    onToggleFavorite,
    onBookFacility,
    onOpenGoogleMaps
}) => {
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
        <Card
            hoverable
            onClick={() => onBookFacility(facility)}
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
                    {FacilityHelper.getSportIcon(facility.sport_type)}

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
                        onClick={(e) => onToggleFavorite(facility.id, e)}
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
                            onOpenGoogleMaps(facility);
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
                            {FacilityHelper.getSportName(facility.sport_type)}
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
};

export default FacilityCard;
