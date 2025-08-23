import React from 'react';
import { Card, Statistic, Progress, Typography, Space } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    TrendingUpOutlined,
    TrendingDownOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const StatCard = ({
    title,
    value,
    prefix,
    suffix,
    precision = 0,
    valueStyle,
    trend,
    trendValue,
    trendText,
    progress,
    loading = false,
    size = 'default', // 'small', 'default', 'large'
    color = '#3f8600',
    onClick
}) => {
    const getTrendIcon = (trend) => {
        if (trend === 'up') return <ArrowUpOutlined />;
        if (trend === 'down') return <ArrowDownOutlined />;
        return null;
    };

    const getTrendColor = (trend) => {
        if (trend === 'up') return '#52c41a';
        if (trend === 'down') return '#ff4d4f';
        return '#666';
    };

    const cardHeight = {
        small: 120,
        default: 140,
        large: 160
    };

    const titleSize = {
        small: '12px',
        default: '14px',
        large: '16px'
    };

    const valueSize = {
        small: '20px',
        default: '24px',
        large: '32px'
    };

    return (
        <Card
            hoverable={!!onClick}
            onClick={onClick}
            loading={loading}
            style={{
                height: cardHeight[size],
                cursor: onClick ? 'pointer' : 'default'
            }}
  styles={{
    body: {
      padding: size === 'small' ? '16px' : '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
  }}
        >
            <div>
                <Statistic
                    title={
                        <Text style={{
                            fontSize: titleSize[size],
                            color: '#666'
                        }}>
                            {title}
                        </Text>
                    }
                    value={value}
                    precision={precision}
                    prefix={prefix}
                    suffix={suffix}
                    valueStyle={{
                        color,
                        fontSize: valueSize[size],
                        fontWeight: 'bold',
                        ...valueStyle
                    }}
                />
            </div>

            {/* Trend or Progress */}
            <div style={{ marginTop: 8 }}>
                {trend && (
                    <Space size={4}>
                        {getTrendIcon(trend)}
                        <Text
                            style={{
                                color: getTrendColor(trend),
                                fontSize: size === 'small' ? '11px' : '12px',
                                fontWeight: '500'
                            }}
                        >
                            {trendValue && `${trendValue}${typeof trendValue === 'number' ? '%' : ''}`}
                            {trendText && ` ${trendText}`}
                        </Text>
                    </Space>
                )}

                {progress && (
                    <div>
                        <Progress
                            percent={progress.percent}
                            size="small"
                            strokeColor={progress.color || color}
                            showInfo={false}
                            style={{ marginBottom: 4 }}
                        />
                        <Text style={{
                            fontSize: size === 'small' ? '10px' : '11px',
                            color: '#666'
                        }}>
                            {progress.text || `${progress.percent}% hoàn thành`}
                        </Text>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Predefined stat card variants

export default StatCard;