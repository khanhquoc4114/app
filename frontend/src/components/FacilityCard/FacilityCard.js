import React from 'react';
import { Card, Tag, Button, Rate, Typography, Space, Badge } from 'antd';
import {EnvironmentOutlined,ClockCircleOutlined,StarOutlined,WifiOutlined,CarOutlined,HomeOutlined,ShopOutlined
} from '@ant-design/icons';

const { Text, Paragraph } = Typography;
const { Meta } = Card;

const FacilityCard = ({
    facility,
    onBook,
    onViewDetails,
    showBookButton = true,
    size = 'default' // 'small', 'default', 'large'
}) => {
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

    const getAmenityIcon = (amenity) => {
        const icons = {
            'Wifi': <WifiOutlined />,
            'Bãi đỗ xe': <CarOutlined />,
            'Điều hòa': <HomeOutlined />,
            'Phòng thay đồ': <ShopOutlined />
        };
        return icons[amenity] || <ShopOutlined />;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const getStatusColor = (status) => {
        const colors = {
            active: 'green',
            maintenance: 'orange',
            inactive: 'red'
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            active: 'Hoạt động',
            maintenance: 'Bảo trì',
            inactive: 'Tạm ngưng'
        };
        return texts[status] || status;
    };

    const cardHeight = {
        small: 300,
        default: 400,
        large: 500
    };

    const imageHeight = {
        small: 120,
        default: 200,
        large: 250
    };

    return (
        <Badge.Ribbon
            text={getStatusText(facility.status)}
            color={getStatusColor(facility.status)}
            style={{ display: facility.status !== 'active' ? 'block' : 'none' }}
        >
            <Card
                hoverable
                style={{
                    height: cardHeight[size],
                    opacity: facility.status === 'active' ? 1 : 0.7
                }}
                cover={
                    <div
                        style={{
                            height: imageHeight[size],
                            background: facility.cover_image
                                ? `url(${facility.cover_image}) center/cover`
                                : 'linear-gradient(45deg, #f0f2f5, #d9d9d9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: size === 'small' ? '32px' : '48px',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                        onClick={() => onViewDetails?.(facility)}
                    >
                        {!facility.cover_image && getSportIcon(facility.sport_type)}

                        {/* Rating overlay */}
                        {facility.rating && (
                            <div style={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                background: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <StarOutlined style={{ marginRight: 4 }} />
                                {facility.rating}
                            </div>
                        )}

                        {/* Price overlay */}
                        <div style={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            background: 'rgba(24, 144, 255, 0.9)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: size === 'small' ? '12px' : '14px',
                            fontWeight: 'bold'
                        }}>
                            {formatPrice(facility.price_per_hour)}/h
                        </div>
                    </div>
                }
                actions={showBookButton && facility.status === 'active' ? [
                    <Button
                        type="primary"
                        onClick={() => onBook?.(facility)}
                        disabled={facility.status !== 'active'}
                    >
                        Đặt sân
                    </Button>,
                    <Button onClick={() => onViewDetails?.(facility)}>
                        Chi tiết
                    </Button>
                ] : [
                    <Button onClick={() => onViewDetails?.(facility)}>
                        Xem chi tiết
                    </Button>
                ]}
            >
                <Meta
                    title={
                        <div>
                            <div style={{
                                fontSize: size === 'small' ? '14px' : '16px',
                                marginBottom: 4
                            }}>
                                {facility.name}
                            </div>
                            <Tag color="blue" size="small">
                                {getSportName(facility.sport_type)}
                            </Tag>
                        </div>
                    }
                    description={
                        <div>
                            {size !== 'small' && (
                                <Paragraph
                                    ellipsis={{ rows: 2 }}
                                    style={{
                                        marginBottom: 8,
                                        fontSize: '13px',
                                        color: '#666'
                                    }}
                                >
                                    {facility.description}
                                </Paragraph>
                            )}

                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                <div>
                                    <EnvironmentOutlined style={{ marginRight: 4, color: '#faad14' }} />
                                    <Text style={{ fontSize: '12px' }}>{facility.location}</Text>
                                </div>

                                {facility.opening_hours && (
                                    <div>
                                        <ClockCircleOutlined style={{ marginRight: 4, color: '#52c41a' }} />
                                        <Text style={{ fontSize: '12px' }}>{facility.opening_hours}</Text>
                                    </div>
                                )}

                                {facility.rating && facility.reviews_count && (
                                    <div>
                                        <Rate
                                            disabled
                                            defaultValue={facility.rating}
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Text style={{ marginLeft: 8, fontSize: '12px', color: '#666' }}>
                                            ({facility.reviews_count} đánh giá)
                                        </Text>
                                    </div>
                                )}

                                {facility.amenities && facility.amenities.length > 0 && (
                                    <div style={{ marginTop: 8 }}>
                                        <Space wrap size={[4, 4]}>
                                            {facility.amenities.slice(0, size === 'small' ? 2 : 4).map(amenity => (
                                                <Tag
                                                    key={amenity}
                                                    size="small"
                                                    icon={getAmenityIcon(amenity)}
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    {amenity}
                                                </Tag>
                                            ))}
                                            {facility.amenities.length > (size === 'small' ? 2 : 4) && (
                                                <Tag size="small" style={{ fontSize: '10px' }}>
                                                    +{facility.amenities.length - (size === 'small' ? 2 : 4)}
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>
                                )}

                                {/* Booking stats for host/admin view */}
                                {facility.bookings_count !== undefined && (
                                    <div style={{ marginTop: 8 }}>
                                        <Text style={{ fontSize: '12px', color: '#1890ff' }}>
                                            {facility.bookings_count} lượt đặt hôm nay
                                        </Text>
                                    </div>
                                )}
                            </Space>
                        </div>
                    }
                />
            </Card>
        </Badge.Ribbon>
    );
};

export default FacilityCard;