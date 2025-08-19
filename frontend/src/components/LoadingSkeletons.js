import React from 'react';
import { Card, Skeleton, Row, Col } from 'antd';

export const FacilityCardSkeleton = () => (
    <Card>
        <Skeleton.Image style={{ width: '100%', height: 200 }} />
        <div style={{ padding: '16px 0' }}>
            <Skeleton active paragraph={{ rows: 3 }} />
        </div>
    </Card>
);
