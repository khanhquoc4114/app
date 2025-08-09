import React, { useState } from 'react';
import {
    Card,
    Input,
    Select,
    Slider,
    DatePicker,
    TimePicker,
    Button,
    Space,
    Collapse,
    Row,
    Col,
    Tag,
    Rate
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    ClearOutlined,
    EnvironmentOutlined,
    DollarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const AdvancedSearch = ({ onSearch, onFilterChange }) => {
    const [filters, setFilters] = useState({
        keyword: '',
        sport: 'all',
        location: 'all',
        priceRange: [0, 500000],
        dateRange: null,
        timeRange: null,
        rating: 0,
        amenities: []
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const sports = [
        { value: 'all', label: 'Tất cả môn' },
        { value: 'badminton', label: 'Cầu lông' },
        { value: 'football', label: 'Bóng đá' },
        { value: 'tennis', label: 'Tennis' },
        { value: 'basketball', label: 'Bóng rổ' },
        { value: 'volleyball', label: 'Bóng chuyền' }
    ];

    const locations = [
        { value: 'all', label: 'Tất cả khu vực' },
        { value: 'district1', label: 'Quận 1' },
        { value: 'district3', label: 'Quận 3' },
        { value: 'district7', label: 'Quận 7' },
        { value: 'district10', label: 'Quận 10' },
        { value: 'district2', label: 'Quận 2' }
    ];

    const amenities = [
        'Điều hòa', 'Thay đồ', 'Nước uống', 'Wifi miễn phí',
        'Bãi đỗ xe', 'Căng tin', 'Âm thanh', 'Khán đài'
    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange && onFilterChange(newFilters);
    };

    const handleSearch = (value) => {
        handleFilterChange('keyword', value);
        onSearch && onSearch(value);
    };

    const clearFilters = () => {
        const defaultFilters = {
            keyword: '',
            sport: 'all',
            location: 'all',
            priceRange: [0, 500000],
            dateRange: null,
            timeRange: null,
            rating: 0,
            amenities: []
        };
        setFilters(defaultFilters);
        onFilterChange && onFilterChange(defaultFilters);
    };

    const formatPrice = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    };

    return (
        <Card style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
                {/* Basic Search */}
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Tìm kiếm sân..."
                            prefix={<SearchOutlined />}
                            value={filters.keyword}
                            onChange={(e) => handleFilterChange('keyword', e.target.value)}
                            onSearch={handleSearch}
                            allowClear
                            size="large"
                        />
                    </Col>
                    <Col xs={24} sm={6} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Môn thể thao"
                            value={filters.sport}
                            onChange={(value) => handleFilterChange('sport', value)}
                            size="large"
                        >
                            {sports.map(sport => (
                                <Option key={sport.value} value={sport.value}>
                                    {sport.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={6} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Khu vực"
                            value={filters.location}
                            onChange={(value) => handleFilterChange('location', value)}
                            size="large"
                        >
                            {locations.map(location => (
                                <Option key={location.value} value={location.value}>
                                    {location.label}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Button
                            type={showAdvanced ? 'primary' : 'default'}
                            icon={<FilterOutlined />}
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            size="large"
                            block
                        >
                            Lọc nâng cao
                        </Button>
                    </Col>
                    <Col xs={12} sm={6} md={4}>
                        <Button
                            icon={<ClearOutlined />}
                            onClick={clearFilters}
                            size="large"
                            block
                        >
                            Xóa bộ lọc
                        </Button>
                    </Col>
                </Row>

                {/* Advanced Filters */}
                {showAdvanced && (
                    <Collapse defaultActiveKey={['1']} ghost>
                        <Panel header="Bộ lọc nâng cao" key="1">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                            <DollarOutlined /> Khoảng giá (VNĐ/giờ)
                                        </label>
                                        <Slider
                                            range
                                            min={0}
                                            max={500000}
                                            step={10000}
                                            value={filters.priceRange}
                                            onChange={(value) => handleFilterChange('priceRange', value)}
                                            tooltip={{
                                                formatter: formatPrice
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                                            <span>{formatPrice(filters.priceRange[0])}</span>
                                            <span>{formatPrice(filters.priceRange[1])}</span>
                                        </div>
                                    </div>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                            Đánh giá tối thiểu
                                        </label>
                                        <Rate
                                            value={filters.rating}
                                            onChange={(value) => handleFilterChange('rating', value)}
                                        />
                                    </div>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                            Ngày muốn đặt
                                        </label>
                                        <RangePicker
                                            style={{ width: '100%' }}
                                            value={filters.dateRange}
                                            onChange={(dates) => handleFilterChange('dateRange', dates)}
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </div>
                                </Col>

                                <Col xs={24} sm={12} md={8}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                            Khung giờ mong muốn
                                        </label>
                                        <TimePicker.RangePicker
                                            style={{ width: '100%' }}
                                            value={filters.timeRange}
                                            onChange={(times) => handleFilterChange('timeRange', times)}
                                            format="HH:mm"
                                        />
                                    </div>
                                </Col>

                                <Col xs={24}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                            Tiện ích
                                        </label>
                                        <Space wrap>
                                            {amenities.map(amenity => (
                                                <Tag.CheckableTag
                                                    key={amenity}
                                                    checked={filters.amenities.includes(amenity)}
                                                    onChange={(checked) => {
                                                        const newAmenities = checked
                                                            ? [...filters.amenities, amenity]
                                                            : filters.amenities.filter(a => a !== amenity);
                                                        handleFilterChange('amenities', newAmenities);
                                                    }}
                                                >
                                                    {amenity}
                                                </Tag.CheckableTag>
                                            ))}
                                        </Space>
                                    </div>
                                </Col>
                            </Row>
                        </Panel>
                    </Collapse>
                )}

                {/* Active Filters Display */}
                {(filters.sport !== 'all' || filters.location !== 'all' || filters.rating > 0 || filters.amenities.length > 0) && (
                    <div>
                        <span style={{ marginRight: 8, fontWeight: 500 }}>Bộ lọc đang áp dụng:</span>
                        <Space wrap>
                            {filters.sport !== 'all' && (
                                <Tag closable onClose={() => handleFilterChange('sport', 'all')}>
                                    {sports.find(s => s.value === filters.sport)?.label}
                                </Tag>
                            )}
                            {filters.location !== 'all' && (
                                <Tag closable onClose={() => handleFilterChange('location', 'all')}>
                                    <EnvironmentOutlined /> {locations.find(l => l.value === filters.location)?.label}
                                </Tag>
                            )}
                            {filters.rating > 0 && (
                                <Tag closable onClose={() => handleFilterChange('rating', 0)}>
                                    Từ {filters.rating} sao
                                </Tag>
                            )}
                            {filters.amenities.map(amenity => (
                                <Tag
                                    key={amenity}
                                    closable
                                    onClose={() => handleFilterChange('amenities', filters.amenities.filter(a => a !== amenity))}
                                >
                                    {amenity}
                                </Tag>
                            ))}
                        </Space>
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default AdvancedSearch;