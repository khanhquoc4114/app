import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Row,
    Col,
    Input,
    Select,
    Slider,
    Button,
    Space,
    Typography,
    Checkbox,
    Rate,
    Tag,
    Divider,
    AutoComplete
} from 'antd';
import {
    SearchOutlined,
    EnvironmentOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    StarOutlined,
    ClearOutlined,
    DownOutlined,
    UpOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { Option } = Select;

const AdvancedSearch = ({
    onSearch,
    onFilterChange,
    initialFilters = {},
    showAdvanced = false,
    facilities = []
}) => {
    const [filters, setFilters] = useState({
        searchText: '',
        sport: 'all',
        priceRange: [0, 500000],
        location: 'all',
        rating: 0,
        amenities: [],
        timeRange: null,
        availability: 'all',
        sortBy: 'name',
        ...initialFilters
    });

    // Update filters when initialFilters change
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            ...initialFilters
        }));
    }, [initialFilters]);

    const [isAdvancedVisible, setIsAdvancedVisible] = useState(showAdvanced);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // Generate autocomplete options from facilities
    const facilityNameOptions = useMemo(() => {
        if (!facilities || facilities.length === 0) return [];
        const names = facilities.map(facility => ({
            value: facility.name,
            label: facility.name,
            type: 'name'
        }));
        return [...new Set(names.map(item => item.value))].map(name => ({
            value: name,
            label: name,
            type: 'name'
        }));
    }, [facilities]);

    const facilityLocationOptions = useMemo(() => {
        if (!facilities || facilities.length === 0) return [];
        const locations = [];
        
        facilities.forEach(facility => {
            // Add district
            if (facility.district) {
                locations.push({
                    value: facility.district,
                    label: facility.district,
                    type: 'district'
                });
            }
            
            // Add address/street
            if (facility.address) {
                locations.push({
                    value: facility.address,
                    label: facility.address,
                    type: 'address'
                });
            }
            
            // Add full location
            if (facility.location) {
                locations.push({
                    value: facility.location,
                    label: facility.location,
                    type: 'full'
                });
            }
        });
        
        // Remove duplicates
        const uniqueLocations = locations.filter((location, index, self) => 
            index === self.findIndex(l => l.value === location.value)
        );
        
        return uniqueLocations;
    }, [facilities]);

    const searchOptions = useMemo(() => {
        const options = [
            ...facilityNameOptions.map(option => ({
                ...option,
                label: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <SearchOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                        <span>Tên sân: <strong>{option.value}</strong></span>
                    </div>
                )
            })),
            ...facilityLocationOptions.map(option => ({
                ...option,
                label: (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ marginRight: 8, color: '#52c41a' }} />
                        <span>Địa điểm: <strong>{option.value}</strong></span>
                    </div>
                )
            }))
        ];
        return options;
    }, [facilityNameOptions, facilityLocationOptions]);

    const sportOptions = [
        { value: 'all', label: 'Tất cả môn', icon: '🏃' },
        { value: 'badminton', label: 'Cầu lông', icon: '🏸' },
        { value: 'football', label: 'Bóng đá', icon: '⚽' },
        { value: 'tennis', label: 'Tennis', icon: '🎾' },
        { value: 'basketball', label: 'Bóng rổ', icon: '🏀' }
    ];

    const locationOptions = useMemo(() => {
        if (!facilities || facilities.length === 0) {
            return [{ value: 'all', label: 'Tất cả khu vực' }];
        }
        
        const districts = [...new Set(facilities.map(f => f.district).filter(Boolean))];
        return [
            { value: 'all', label: 'Tất cả khu vực' },
            ...districts.map(district => ({
                value: district,
                label: district
            }))
        ];
    }, [facilities]);

    const amenityOptions = [
        { value: 'parking', label: 'Bãi đỗ xe', icon: '🚗' },
        { value: 'ac', label: 'Điều hòa', icon: '❄️' },
        { value: 'wifi', label: 'Wifi miễn phí', icon: '📶' },
        { value: 'shower', label: 'Phòng tắm', icon: '🚿' },
        { value: 'locker', label: 'Tủ khóa', icon: '🔒' },
        { value: 'canteen', label: 'Căng tin', icon: '🍽️' },
        { value: 'equipment', label: 'Cho thuê dụng cụ', icon: '🏓' },
        { value: 'security', label: 'Bảo vệ 24/7', icon: '🛡️' }
    ];

    const sortOptions = [
        { value: 'name', label: 'Tên sân A-Z' },
        { value: 'price_asc', label: 'Giá thấp đến cao' },
        { value: 'price_desc', label: 'Giá cao đến thấp' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
        { value: 'popular', label: 'Phổ biến nhất' }
    ];

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Count active filters
        const count = Object.entries(newFilters).filter(([k, v]) => {
            if (k === 'searchText') return v.length > 0;
            if (k === 'sport') return v !== 'all';
            if (k === 'location') return v !== 'all';
            if (k === 'priceRange') return v[0] > 0 || v[1] < 500000;
            if (k === 'rating') return v > 0;
            if (k === 'amenities') return v.length > 0;
            if (k === 'availability') return v !== 'all';
            return false;
        }).length;

        setActiveFiltersCount(count);

        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch(filters);
        }
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            searchText: '',
            sport: 'all',
            priceRange: [0, 500000],
            location: 'all',
            rating: 0,
            amenities: [],
            timeRange: null,
            availability: 'all',
            sortBy: 'name'
        };
        setFilters(clearedFilters);
        setActiveFiltersCount(0);
        if (onFilterChange) {
            onFilterChange(clearedFilters);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <Card
            className="advanced-search-card"
            style={{
                marginBottom: 24,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
            {/* Basic Search */}
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8} md={10}>
                    <AutoComplete
                        size="large"
                        style={{ width: '100%' }}
                        options={searchOptions}
                        value={filters.searchText}
                        onChange={(value) => handleFilterChange('searchText', value)}
                        onSelect={(value) => handleFilterChange('searchText', value)}
                        placeholder="Tìm kiếm theo tên sân hoặc địa điểm..."
                        allowClear
                        filterOption={(inputValue, option) =>
                            option.value.toLowerCase().includes(inputValue.toLowerCase())
                        }
                    >
                        <Input
                            prefix={<SearchOutlined />}
                            onPressEnter={handleSearch}
                        />
                    </AutoComplete>
                </Col>

                <Col xs={24} sm={6} md={4}>
                    <Select
                        size="large"
                        style={{ width: '100%' }}
                        value={filters.sport}
                        onChange={(value) => handleFilterChange('sport', value)}
                        placeholder="Môn thể thao"
                    >
                        {sportOptions.map(sport => (
                            <Option key={sport.value} value={sport.value}>
                                <Space>
                                    <span>{sport.icon}</span>
                                    <span>{sport.label}</span>
                                </Space>
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={6} md={4}>
                    <Select
                        size="large"
                        style={{ width: '100%' }}
                        value={filters.location}
                        onChange={(value) => handleFilterChange('location', value)}
                        placeholder="Khu vực"
                        suffixIcon={<EnvironmentOutlined />}
                    >
                        {locationOptions.map(location => (
                            <Option key={location.value} value={location.value}>
                                {location.label}
                            </Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={4} md={6}>
                    <Space>
                        <Button
                            type="primary"
                            size="large"
                            icon={<SearchOutlined />}
                            onClick={handleSearch}
                        >
                            Tìm kiếm
                        </Button>

                        <Button
                            size="large"
                            icon={isAdvancedVisible ? <UpOutlined /> : <DownOutlined />}
                            onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
                        >
                            Lọc nâng cao
                            {activeFiltersCount > 0 && (
                                <Tag
                                    color="blue"
                                    style={{ marginLeft: 4, minWidth: 20 }}
                                >
                                    {activeFiltersCount}
                                </Tag>
                            )}
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Advanced Filters */}
            {isAdvancedVisible && (
                <>
                    <Divider />
                    <div style={{ marginTop: 16 }}>
                        <Row gutter={[24, 16]}>
                            {/* Price Range */}
                            <Col xs={24} md={8}>
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                        <DollarOutlined /> Khoảng giá
                                    </Text>
                                    <Slider
                                        range
                                        min={0}
                                        max={500000}
                                        step={10000}
                                        value={filters.priceRange}
                                        onChange={(value) => handleFilterChange('priceRange', value)}
                                        tooltip={{
                                            formatter: (value) => formatPrice(value)
                                        }}
                                    />
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '12px',
                                        color: '#666'
                                    }}>
                                        <span>{formatPrice(filters.priceRange[0])}</span>
                                        <span>{formatPrice(filters.priceRange[1])}</span>
                                    </div>
                                </div>
                            </Col>

                            {/* Rating */}
                            <Col xs={24} md={8}>
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                        <StarOutlined /> Đánh giá tối thiểu
                                    </Text>
                                    <Rate
                                        value={filters.rating}
                                        onChange={(value) => handleFilterChange('rating', value)}
                                        style={{ fontSize: '20px' }}
                                    />
                                    <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                                        {filters.rating > 0 ? `${filters.rating} sao trở lên` : 'Tất cả đánh giá'}
                                    </div>
                                </div>
                            </Col>

                            {/* Sort */}
                            <Col xs={24} md={8}>
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                        Sắp xếp theo
                                    </Text>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={filters.sortBy}
                                        onChange={(value) => handleFilterChange('sortBy', value)}
                                    >
                                        {sortOptions.map(option => (
                                            <Option key={option.value} value={option.value}>
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
                            {/* Amenities */}
                            <Col xs={24} md={16}>
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                        Tiện ích
                                    </Text>
                                    <Checkbox.Group
                                        value={filters.amenities}
                                        onChange={(value) => handleFilterChange('amenities', value)}
                                    >
                                        <Row gutter={[8, 8]}>
                                            {amenityOptions.map(amenity => (
                                                <Col key={amenity.value} xs={12} sm={8} md={6}>
                                                    <Checkbox value={amenity.value}>
                                                        <Space size={4}>
                                                            <span>{amenity.icon}</span>
                                                            <span style={{ fontSize: '13px' }}>
                                                                {amenity.label}
                                                            </span>
                                                        </Space>
                                                    </Checkbox>
                                                </Col>
                                            ))}
                                        </Row>
                                    </Checkbox.Group>
                                </div>
                            </Col>

                            {/* Availability */}
                            <Col xs={24} md={8}>
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                        <ClockCircleOutlined /> Tình trạng
                                    </Text>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={filters.availability}
                                        onChange={(value) => handleFilterChange('availability', value)}
                                    >
                                        <Option value="all">Tất cả</Option>
                                        <Option value="available">Còn trống</Option>
                                        <Option value="busy">Đang bận</Option>
                                    </Select>
                                </div>
                            </Col>
                        </Row>

                        {/* Action Buttons */}
                        <div style={{
                            marginTop: 20,
                            paddingTop: 16,
                            borderTop: '1px solid #f0f0f0',
                            textAlign: 'right'
                        }}>
                            <Space>
                                <Button
                                    icon={<ClearOutlined />}
                                    onClick={handleClearFilters}
                                    disabled={activeFiltersCount === 0}
                                >
                                    Xóa bộ lọc
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SearchOutlined />}
                                    onClick={handleSearch}
                                >
                                    Áp dụng bộ lọc
                                </Button>
                            </Space>
                        </div>
                    </div>
                </>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <Text type="secondary" style={{ marginRight: 8 }}>
                        Bộ lọc đang áp dụng:
                    </Text>
                    <Space wrap>
                        {filters.sport !== 'all' && (
                            <Tag
                                closable
                                onClose={() => handleFilterChange('sport', 'all')}
                                color="blue"
                            >
                                {sportOptions.find(s => s.value === filters.sport)?.label}
                            </Tag>
                        )}
                        {filters.location !== 'all' && (
                            <Tag
                                closable
                                onClose={() => handleFilterChange('location', 'all')}
                                color="green"
                            >
                                {locationOptions.find(l => l.value === filters.location)?.label}
                            </Tag>
                        )}
                        {(filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) && (
                            <Tag
                                closable
                                onClose={() => handleFilterChange('priceRange', [0, 500000])}
                                color="orange"
                            >
                                {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                            </Tag>
                        )}
                        {filters.rating > 0 && (
                            <Tag
                                closable
                                onClose={() => handleFilterChange('rating', 0)}
                                color="gold"
                            >
                                {filters.rating}+ sao
                            </Tag>
                        )}
                        {filters.amenities.map(amenity => (
                            <Tag
                                key={amenity}
                                closable
                                onClose={() => handleFilterChange('amenities',
                                    filters.amenities.filter(a => a !== amenity)
                                )}
                                color="purple"
                            >
                                {amenityOptions.find(a => a.value === amenity)?.label}
                            </Tag>
                        ))}
                    </Space>
                </div>
            )}
        </Card>
    );
};

export default AdvancedSearch;