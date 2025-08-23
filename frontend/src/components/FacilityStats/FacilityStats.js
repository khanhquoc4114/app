import React from 'react';
import { Space, Typography, Tag } from 'antd';
import { HeartFilled, EnvironmentOutlined, ShopOutlined } from '@ant-design/icons';

const { Text } = Typography;

const FacilityStats = ({
    totalCount,
    favoriteCount,
    nearbyCount,
    hasLocation
}) => {
    return (
        <div style={{ marginBottom: 16 }}>
            <Space wrap size="middle">
                <Space>
                    <ShopOutlined style={{ color: '#1890ff' }} />
                    <Text type="secondary">
                        Tìm thấy <strong style={{ color: '#1890ff' }}>{totalCount}</strong> sân phù hợp
                    </Text>
                </Space>

                {favoriteCount > 0 && (
                    <Space>
                        <HeartFilled style={{ color: '#ff4d4f' }} />
                        <Text type="secondary">
                            <strong style={{ color: '#ff4d4f' }}>{favoriteCount}</strong> sân yêu thích
                        </Text>
                    </Space>
                )}

                {hasLocation && nearbyCount > 0 && (
                    <Space>
                        <EnvironmentOutlined style={{ color: '#52c41a' }} />
                        <Text type="secondary">
                            <strong style={{ color: '#52c41a' }}>{nearbyCount}</strong> sân gần bạn (≤5km)
                        </Text>
                    </Space>
                )}

                {hasLocation && (
                    <Space>
                        <Tag color="success" style={{ margin: 0 }}>
                            ✅ Đã bật định vị
                        </Tag>
                    </Space>
                )}
            </Space>
        </div>
    );
};

export default FacilityStats;