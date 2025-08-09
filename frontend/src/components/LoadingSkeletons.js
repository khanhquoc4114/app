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

export const FacilityListSkeleton = () => (
    <Row gutter={[16, 16]}>
        {[1, 2, 3, 4, 5, 6].map(key => (
            <Col xs={24} sm={12} lg={8} key={key}>
                <FacilityCardSkeleton />
            </Col>
        ))}
    </Row>
);

export const BookingPageSkeleton = () => (
    <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
            <Card>
                <Skeleton.Image style={{ width: 64, height: 64 }} />
                <Skeleton active paragraph={{ rows: 2 }} style={{ marginTop: 16 }} />
                <div style={{ marginTop: 24 }}>
                    <Skeleton.Button style={{ width: '100%', height: 40 }} />
                </div>
                <div style={{ marginTop: 24 }}>
                    <Row gutter={[8, 8]}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(key => (
                            <Col xs={12} sm={8} md={6} key={key}>
                                <Skeleton.Button style={{ width: '100%', height: 40 }} />
                            </Col>
                        ))}
                    </Row>
                </div>
            </Card>
        </Col>
        <Col xs={24} lg={8}>
            <Card title={<Skeleton.Button style={{ width: 150 }} />}>
                <Skeleton active paragraph={{ rows: 6 }} />
                <Skeleton.Button style={{ width: '100%', height: 48, marginTop: 16 }} />
            </Card>
        </Col>
    </Row>
);

export const DashboardSkeleton = () => (
    <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[1, 2, 3, 4].map(key => (
                <Col xs={24} sm={12} lg={6} key={key}>
                    <Card>
                        <Skeleton active paragraph={{ rows: 1 }} />
                    </Card>
                </Col>
            ))}
        </Row>
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
                <Card>
                    <Skeleton active paragraph={{ rows: 8 }} />
                </Card>
            </Col>
            <Col xs={24} lg={10}>
                <Card>
                    <Skeleton active paragraph={{ rows: 6 }} />
                </Card>
            </Col>
        </Row>
    </div>
);