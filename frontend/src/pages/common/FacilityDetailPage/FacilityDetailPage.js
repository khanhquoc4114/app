import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Rate, Button, Avatar, Divider, Row, Col, message, Spin, Modal, Form, DatePicker, Space, Breadcrumb, Tabs, Image, Carousel, Statistic, Timeline, Badge, Tooltip, Progress } from 'antd';
import { EnvironmentOutlined, UserOutlined, ArrowLeftOutlined, HeartOutlined, HeartFilled, HomeOutlined, PhoneOutlined, ShareAltOutlined, CalendarOutlined, DollarOutlined, StarOutlined, CheckCircleOutlined, WifiOutlined, CarOutlined, SafetyOutlined, CoffeeOutlined, ToolOutlined, TeamOutlined, TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const FacilityDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [owner, setOwner] = useState(null);
  // const [comments, setComments] = useState([]); // Tạm thời không dùng
  const [relatedFacilities, setRelatedFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [facilityStats, setFacilityStats] = useState({});
  const [weatherInfo, setWeatherInfo] = useState(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const API_URL = process.env.REACT_APP_API_URL;

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('facilityFavorites');
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(parsedFavorites);
      } catch (error) {
        console.error('Error parsing favorites from localStorage:', error);
        localStorage.removeItem('facilityFavorites');
      }
    }
  }, []);

  // Open Google Maps with directions from user location to facility
  const openGoogleMaps = (facility) => {
    console.log('Opening Google Maps for:', facility.name);
    const destination = encodeURIComponent(facility.location);
    let url;

    if (userLocation) {
      url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${destination}`;
    } else {
      url = `https://www.google.com/maps/search/${destination}`;
    }

    window.open(url, '_blank');
  };

  // Toggle favorite facility
  const toggleFavoriteFacility = (facilityId) => {
    const savedFavorites = localStorage.getItem('facilityFavorites');
    let currentFavorites = savedFavorites ? JSON.parse(savedFavorites) : [];

    const isFavorited = currentFavorites.includes(facilityId);
    let newFavorites;

    if (isFavorited) {
      newFavorites = currentFavorites.filter(id => id !== facilityId);
    } else {
      newFavorites = [...currentFavorites, facilityId];
    }

    localStorage.setItem('facilityFavorites', JSON.stringify(newFavorites));
    setFavorites(newFavorites);

    return {
      isFavorite: !isFavorited,
      message: isFavorited ? 'Đã bỏ khỏi danh sách yêu thích' : 'Đã thêm vào danh sách yêu thích'
    };
  };

  // Check if facility is favorite
  const isFavoriteFacility = (facilityId) => {
    return favorites.includes(facilityId);
  };

  // Generate time slots based on opening hours
  const generateTimeSlots = (openingHours) => {
    const [startTime, endTime] = openingHours.split(' - ');
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);

    const slots = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Fetch booked slots from database for specific facility and date
  const fetchBookedSlots = async (facilityId, date) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found for fetching booked slots');
        return {};
      }

      if (!API_URL) {
        console.error('API_URL not configured');
        return {};
      }

      const dateString = date.format('YYYY-MM-DD');
      const res = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        console.warn('Failed to fetch bookings:', res.status);
        return {};
      }

      const bookings = await res.json();

      // Filter bookings for this facility and date
      const facilityBookings = bookings.filter(booking => {
        const bookingDate = booking.start_time ? booking.start_time.split('T')[0] : '';
        return booking.facility_id === facilityId && bookingDate === dateString;
      });

      // Mark booked time slots
      const booked = {};
      facilityBookings.forEach(booking => {
        if (booking.start_time && booking.end_time) {
          const startTime = new Date(booking.start_time);
          const endTime = new Date(booking.end_time);
          for (let hour = startTime.getHours(); hour < endTime.getHours(); hour++) {
            const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
            booked[timeSlot] = true;
          }
        }
      });
      return booked;
    } catch (error) {
      console.error('Error fetching booked slots:', error);
      return {};
    }
  };

  // Handle time slot selection
  const handleTimeSlotChange = (timeSlot) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(timeSlot)) {
        return prev.filter(slot => slot !== timeSlot);
      } else {
        return [...prev, timeSlot];
      }
    });
  };

  // Handle date change
  const handleDateChange = async (date) => {
    setSelectedDate(date);
    setSelectedTimeSlots([]); // Clear selected slots when date changes

    // Fetch real booked slots for new date if not exists
    if (facility) {
      const facilityDateKey = `${facility.id}_${date.format('YYYY-MM-DD')}`;
      if (!bookedSlots[facilityDateKey]) {
        const bookedSlotsFromDB = await fetchBookedSlots(facility.id, date);
        setBookedSlots(prev => ({
          ...prev,
          [facilityDateKey]: bookedSlotsFromDB
        }));
      }
    }
  };

  // Handle booking submission
  const handleBookingSubmit = async () => {
    if (!selectedTimeSlots.length) {
      message.error('Vui lòng chọn ít nhất một khung giờ');
      return;
    }

    if (!facility) {
      message.error('Thông tin sân không hợp lệ');
      return;
    }

    if (!selectedDate) {
      message.error('Vui lòng chọn ngày đặt sân');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Vui lòng đăng nhập để đặt sân');
      return;
    }

    if (!API_URL) {
      message.error('Cấu hình API không hợp lệ');
      return;
    }

    // Determine start and end time
    const sortedSlots = selectedTimeSlots.sort();
    const startHour = parseInt(sortedSlots[0].split(':')[0]);
    const endHour = parseInt(sortedSlots[sortedSlots.length - 1].split(':')[0]) + 1;

    const startTime = selectedDate.clone().hour(startHour).minute(0).second(0).millisecond(0);
    const endTime = selectedDate.clone().hour(endHour).minute(0).second(0).millisecond(0);

    // Booking data to send to backend
    const bookingData = {
      facility_id: facility.id,
      booking_date: selectedDate.format('YYYY-MM-DDT00:00:00'),
      start_time: startTime.format('YYYY-MM-DDTHH:mm:ss'),
      end_time: endTime.format('YYYY-MM-DDTHH:mm:ss'),
      time_slots: selectedTimeSlots,
      total_price: selectedTimeSlots.length * facility.price_per_hour,
      notes: `Đặt sân ${facility.name} - ${sortedSlots.join(', ')}`
    };

    console.log('Booking data:', bookingData); // Debug log

    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || 'Có lỗi xảy ra khi đặt sân');
      }

      const result = await response.json();
      message.success(`Đặt sân thành công! Mã đặt: ${result.booking_id}`);
      setBookingModalVisible(false);
      setSelectedTimeSlots([]);

      // Refresh booked slots for current date
      const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;
      const bookedSlotsFromDB = await fetchBookedSlots(facility.id, selectedDate);
      setBookedSlots(prev => ({
        ...prev,
        [facilityDateKey]: bookedSlotsFromDB
      }));

    } catch (err) {
      console.error('Booking error:', err);
      message.error(err.message || 'Có lỗi xảy ra khi đặt sân');
    }
  };

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
          setUserLocation(null);
        }
      );
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (!API_URL) {
        message.error('Cấu hình API không hợp lệ');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Lấy thông tin sân
        const res = await fetch(`${API_URL}/api/facilities/${id}`);
        if (!res.ok) {
          throw new Error('Không thể tải thông tin sân');
        }
        const data = await res.json();

        if (!data || !data.opening_hours) {
          throw new Error('Dữ liệu sân không hợp lệ');
        }

        setFacility({
          ...data,
          available_slots: generateTimeSlots(data.opening_hours)
        });

        // Lấy thông tin chủ sân
        if (data.owner_id) {
          const ownerRes = await fetch(`${API_URL}/api/users/${data.owner_id}`);
          if (ownerRes.ok) {
            setOwner(await ownerRes.json());
          }
        }

        // Lấy các sân liên quan (cùng chủ hoặc cùng khu vực)
        const relatedRes = await fetch(`${API_URL}/api/facilities?owner_id=${data.owner_id}&exclude_id=${id}`);
        if (relatedRes.ok) {
          setRelatedFacilities(await relatedRes.json());
        }

        // Set mock data for enhanced features
        setReviews(mockReviews);
        setFacilityStats(mockStats);
      } catch (err) {
        console.error('Error fetching facility data:', err);
        message.error(err.message || 'Không thể tải dữ liệu sân.');
      }
      setLoading(false);
    }
    fetchData();
  }, [id, API_URL]);

  useEffect(() => {
    if (facility) {
      setIsFavorite(isFavoriteFacility(facility.id));
    }
  }, [facility, favorites]);

  // Handle opening booking modal
  const handleBookFacility = async () => {
    if (!facility) {
      message.error('Thông tin sân chưa được tải');
      return;
    }

    setBookingModalVisible(true);

    // Fetch real booked slots from database
    const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;
    if (!bookedSlots[facilityDateKey]) {
      const bookedSlotsFromDB = await fetchBookedSlots(facility.id, selectedDate);
      setBookedSlots(prev => ({
        ...prev,
        [facilityDateKey]: bookedSlotsFromDB
      }));
    }
  };

  const handleToggleFavorite = () => {
    if (!facility) return;
    const result = toggleFavoriteFacility(facility.id);
    setIsFavorite(result.isFavorite);
    message.success(result.message);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Mock data for enhanced features
  const mockReviews = [
    {
      id: 1,
      user: "Nguyễn Văn A",
      avatar: null,
      rating: 5,
      comment: "Sân rất đẹp, sạch sẽ và thoáng mát. Nhân viên phục vụ nhiệt tình.",
      date: "2024-01-15",
      images: []
    },
    {
      id: 2,
      user: "Trần Thị B",
      avatar: null,
      rating: 4,
      comment: "Vị trí thuận tiện, giá cả hợp lý. Chỉ có điều chỗ đỗ xe hơi ít.",
      date: "2024-01-10",
      images: []
    },
    {
      id: 3,
      user: "Lê Minh C",
      avatar: null,
      rating: 5,
      comment: "Sân chất lượng cao, ánh sáng tốt. Sẽ quay lại lần sau!",
      date: "2024-01-08",
      images: []
    }
  ];

  const mockStats = {
    totalBookings: 156,
    monthlyBookings: 23,
    averageRating: 4.7,
    responseTime: "< 2 phút",
    occupancyRate: 78
  };

  // Get amenity icon
  const getAmenityIcon = (amenity) => {
    const icons = {
      'Wifi': <WifiOutlined />,
      'Chỗ đỗ xe': <CarOutlined />,
      'An ninh': <SafetyOutlined />,
      'Căng tin': <CoffeeOutlined />,
      'Phòng thay đồ': <ToolOutlined />,
      'Mái che': <SafetyOutlined />
    };
    return icons[amenity] || <CheckCircleOutlined />;
  };

  // Share facility
  const handleShare = () => {
    setShareModalVisible(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép link!');
  };

  if (loading) return <Spin style={{ marginTop: 40 }} />;
  if (!facility) return <div>Không tìm thấy sân.</div>;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item href="/home">
          <HomeOutlined />
          <span>Trang chủ</span>
        </Breadcrumb.Item>
        <Breadcrumb.Item href="/facilities">
          Danh sách sân
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {facility.name}
        </Breadcrumb.Item>
      </Breadcrumb>

      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        Quay lại
      </Button>
      <Row gutter={32} style={{ marginBottom: 32 }}>
        {/* Left: Image gallery */}
        <Col xs={24} md={10}>
          <Card
            style={{ boxShadow: '0 2px 8px #eee', minHeight: 350 }}
          >
            {facility.image_url ? (
              <Image
                alt={facility.name}
                src={facility.image_url}
                style={{ width: '100%', maxHeight: 350, objectFit: 'cover', borderRadius: 8 }}
                preview={{
                  mask: <div style={{ background: 'rgba(0,0,0,0.5)', color: 'white', padding: '8px' }}>Xem ảnh lớn</div>
                }}
              />
            ) : (
              <div style={{ height: 350, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
                <Text type="secondary">Chưa có hình ảnh</Text>
              </div>
            )}
          </Card>
        </Col>
        {/* Right: Info + actions */}
        <Col xs={24} md={14}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <Title level={2} style={{ marginBottom: 0 }}>{facility.name}</Title>
            <Badge count={facility.is_active ? 'Đang hoạt động' : 'Tạm đóng'}
              style={{ backgroundColor: facility.is_active ? '#52c41a' : '#ff4d4f' }} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>{facility.sport_type}</Tag>
            <Rate disabled defaultValue={facility.rating} style={{ fontSize: 16, marginLeft: 8 }} />
            <Text type="secondary" style={{ marginLeft: 8 }}>
              {facility.rating} ({facility.reviews_count} đánh giá)
            </Text>
          </div>

          <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 20 }}>
            <div>
              <EnvironmentOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              <Text>{facility.location}</Text>
            </div>
            <div>
              <ClockCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              <Text>{facility.opening_hours}</Text>
            </div>
            <div>
              <DollarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              <span style={{ color: '#ff4d4f', fontSize: 18, fontWeight: 'bold' }}>
                {facility.price_per_hour?.toLocaleString()} VND/giờ
              </span>
            </div>
          </Space>

          {/* Amenities with icons */}
          <div style={{ marginBottom: 20 }}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>Tiện ích:</Text>
            <Space wrap>
              {facility.amenities?.map(amenity => (
                <Tag key={amenity} icon={getAmenityIcon(amenity)} style={{ padding: '4px 8px' }}>
                  {amenity}
                </Tag>
              ))}
            </Space>
          </div>

          {/* Owner info */}
          {owner && (
            <Card size="small" style={{ marginBottom: 20, background: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size={40} icon={<UserOutlined />} style={{ marginRight: 12 }} />
                <div>
                  <Text strong>{owner.full_name}</Text>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <PhoneOutlined style={{ marginRight: 4 }} />
                    {owner.phone || 'Chưa cập nhật'}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Action buttons */}
          <Space wrap style={{ width: '100%' }}>
            <Button type="primary" size="large" icon={<CalendarOutlined />} onClick={handleBookFacility}>
              Đặt Sân Ngay
            </Button>
            <Button
              size="large"
              icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
              onClick={handleToggleFavorite}
            >
              {isFavorite ? 'Bỏ Yêu Thích' : 'Yêu Thích'}
            </Button>
            <Button size="large" icon={<EnvironmentOutlined />} onClick={() => openGoogleMaps(facility)}>
              Chỉ đường
            </Button>
            <Button size="large" icon={<ShareAltOutlined />} onClick={handleShare}>
              Chia sẻ
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal
        title={`Đặt sân: ${facility?.name}`}
        open={bookingModalVisible}
        onCancel={() => {
          setBookingModalVisible(false);
          setSelectedTimeSlots([]);
        }}
        footer={null}
        width={600}
      >
        {facility && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Thông tin sân:</Text>
              <div style={{ marginTop: 8 }}>
                <div>📍 {facility.location}</div>
                <div>🕐 {facility.opening_hours}</div>
                <div>💰 {formatPrice(facility.price_per_hour)}/giờ</div>
              </div>
            </div>

            <Form layout="vertical">
              <Form.Item label="Chọn ngày" required>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item label="Chọn khung giờ" required>
                {facility.available_slots && facility.available_slots.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {facility.available_slots.map(slot => {
                      // Get booked status from state
                      const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;
                      const isBooked = bookedSlots[facilityDateKey]?.[slot] || false;
                      const isSelected = selectedTimeSlots.includes(slot);
                      const isPastTime = selectedDate.isSame(dayjs(), 'day') &&
                        parseInt(slot.split(':')[0]) <= dayjs().hour();

                      return (
                        <Button
                          key={slot}
                          type={isSelected ? 'primary' : 'default'}
                          disabled={isBooked || isPastTime}
                          onClick={() => handleTimeSlotChange(slot)}
                          style={{
                            textAlign: 'center',
                            backgroundColor: isBooked ? '#f5f5f5' : undefined,
                            borderColor: isBooked ? '#d9d9d9' : undefined,
                            color: isBooked ? '#999' : undefined
                          }}
                        >
                          <div>{slot}</div>
                          {isBooked && (
                            <div style={{ fontSize: '10px', color: '#ff4d4f' }}>
                              Đã đặt
                            </div>
                          )}
                          {isPastTime && !isBooked && (
                            <div style={{ fontSize: '10px', color: '#999' }}>
                              Đã qua
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    Không có khung giờ khả dụng
                  </div>
                )}
                <div style={{ marginTop: 12 }}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      💡 Có thể chọn nhiều khung giờ liên tiếp
                    </Text>
                    <Space size={16}>
                      <Space size={4}>
                        <div style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#1890ff',
                          borderRadius: 2
                        }} />
                        <Text style={{ fontSize: '11px' }}>Đã chọn</Text>
                      </Space>
                      <Space size={4}>
                        <div style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #d9d9d9',
                          borderRadius: 2
                        }} />
                        <Text style={{ fontSize: '11px' }}>Đã đặt</Text>
                      </Space>
                      <Space size={4}>
                        <div style={{
                          width: 12,
                          height: 12,
                          backgroundColor: '#fff',
                          border: '1px solid #d9d9d9',
                          borderRadius: 2
                        }} />
                        <Text style={{ fontSize: '11px' }}>Còn trống</Text>
                      </Space>
                    </Space>
                  </Space>
                </div>
              </Form.Item>

              {selectedTimeSlots.length > 0 && (
                <Form.Item label="Tổng kết">
                  <div style={{ background: '#f6f6f6', padding: 16, borderRadius: 6 }}>
                    <div>Ngày: {selectedDate.format('DD/MM/YYYY')}</div>
                    <div>Khung giờ: {selectedTimeSlots.sort().join(', ')}</div>
                    <div>Số giờ: {selectedTimeSlots.length} giờ</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                      Tổng tiền: {formatPrice(selectedTimeSlots.length * facility.price_per_hour)}
                    </div>
                  </div>
                </Form.Item>
              )}

              <Form.Item>
                <Space>
                  <Button type="primary" onClick={handleBookingSubmit}>
                    Xác nhận đặt sân
                  </Button>
                  <Button onClick={() => {
                    setBookingModalVisible(false);
                    setSelectedTimeSlots([]);
                  }}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Enhanced Details with Tabs */}
      <Card style={{ marginBottom: 32 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Tổng quan" key="overview">
            <Row gutter={24}>
              <Col xs={24} md={16}>
                <Title level={4}>Mô tả sân</Title>
                <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                  {facility.description || 'Sân thể thao chất lượng cao với đầy đủ tiện nghi hiện đại. Phù hợp cho các hoạt động thể thao chuyên nghiệp và giải trí.'}
                </Paragraph>

                <Title level={4} style={{ marginTop: 24 }}>Thông tin chi tiết</Title>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <Text strong>Loại sân:</Text> {facility.sport_type}
                  </Col>
                  <Col span={12}>
                    <Text strong>Giá/giờ:</Text> {facility.price_per_hour?.toLocaleString()} VND
                  </Col>
                  <Col span={12}>
                    <Text strong>Giờ mở cửa:</Text> {facility.opening_hours}
                  </Col>
                  <Col span={12}>
                    <Text strong>Ngày tạo:</Text> {dayjs(facility.created_at).format('DD/MM/YYYY')}
                  </Col>
                </Row>
              </Col>

              <Col xs={24} md={8}>
                <Title level={4}>Thống kê</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title="Tổng lượt đặt"
                      value={facilityStats.totalBookings}
                      prefix={<TeamOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Đặt tháng này"
                      value={facilityStats.monthlyBookings}
                      prefix={<CalendarOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Đánh giá TB"
                      value={facilityStats.averageRating}
                      precision={1}
                      prefix={<StarOutlined />}
                      suffix="/ 5"
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Phản hồi"
                      value={facilityStats.responseTime}
                      prefix={<ClockCircleOutlined />}
                    />
                  </Col>
                </Row>

                <div style={{ marginTop: 16 }}>
                  <Text strong>Tỷ lệ lấp đầy</Text>
                  <Progress
                    percent={facilityStats.occupancyRate}
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </div>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Đánh giá" key="reviews">
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center', padding: '24px', background: '#fafafa', borderRadius: '8px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#faad14' }}>
                    {facility.rating}
                  </div>
                  <Rate disabled defaultValue={facility.rating} style={{ fontSize: '20px' }} />
                  <div style={{ marginTop: '8px', color: '#666' }}>
                    Dựa trên {facility.reviews_count} đánh giá
                  </div>
                </div>
              </Col>

              <Col xs={24} md={16}>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {reviews.map(review => (
                    <Card key={review.id} size="small" style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar icon={<UserOutlined />} style={{ marginRight: 12 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text strong>{review.user}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {dayjs(review.date).format('DD/MM/YYYY')}
                            </Text>
                          </div>
                          <Rate disabled defaultValue={review.rating} style={{ fontSize: '14px', marginBottom: 8 }} />
                          <Paragraph style={{ marginBottom: 0, fontSize: '14px' }}>
                            {review.comment}
                          </Paragraph>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Chính sách" key="policies">
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Title level={4}>Chính sách đặt sân</Title>
                <Timeline>
                  <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                    <Text strong>Đặt sân trước ít nhất 2 giờ</Text>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      Để đảm bảo sân được chuẩn bị tốt nhất
                    </div>
                  </Timeline.Item>
                  <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                    <Text strong>Thanh toán trước khi sử dụng</Text>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      Hỗ trợ thanh toán online và tại quầy
                    </div>
                  </Timeline.Item>
                  <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                    <Text strong>Hủy sân miễn phí trước 4 giờ</Text>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      Sau thời gian này sẽ tính phí 50%
                    </div>
                  </Timeline.Item>
                  <Timeline.Item dot={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
                    <Text strong>Giữ gìn vệ sinh và trật tự</Text>
                    <div style={{ color: '#666', fontSize: '14px' }}>
                      Không hút thuốc, không mang đồ ăn vào sân
                    </div>
                  </Timeline.Item>
                </Timeline>
              </Col>

              <Col xs={24} md={12}>
                <Title level={4}>Quy định an toàn</Title>
                <Card size="small" style={{ background: '#fff2e8', border: '1px solid #ffbb96' }}>
                  <Space direction="vertical" size={8}>
                    <div>🏃‍♂️ Bắt buộc mang giày thể thao</div>
                    <div>🚫 Không được chơi khi say rượu</div>
                    <div>👥 Tối đa 10 người/sân</div>
                    <div>🕐 Đúng giờ check-in và check-out</div>
                    <div>📱 Giữ liên lạc với quản lý sân</div>
                  </Space>
                </Card>

                <Title level={4} style={{ marginTop: 24 }}>Liên hệ khẩn cấp</Title>
                <Card size="small">
                  <div>📞 Hotline: 1900-xxxx</div>
                  <div>🚑 Cấp cứu: 115</div>
                  <div>🚓 Công an: 113</div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* Các sân khác */}
      <Divider orientation="left">Các sân khác của chủ sân</Divider>
      <Row gutter={[16, 16]}>
        {relatedFacilities.length === 0 && <Text type="secondary">Không có sân nào khác.</Text>}
        {relatedFacilities.map(f => (
          <Col xs={24} sm={12} md={8} key={f.id}>
            <Card
              hoverable
              onClick={() => navigate(`/facilities/${f.id}`)}
              cover={f.image_url && <img alt={f.name} src={f.image_url} style={{ height: 120, objectFit: 'cover' }} />}
            >
              <Card.Meta
                title={f.name}
                description={<>
                  <Tag color="blue">{f.sport_type}</Tag>
                  <div><EnvironmentOutlined /> {f.location}</div>
                  <div>Giá: {f.price_per_hour?.toLocaleString()} VND/giờ</div>
                </>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Share Modal */}
      <Modal
        title="Chia sẻ sân thể thao"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={null}
        width={400}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Text strong>Link chia sẻ:</Text>
            <div style={{ display: 'flex', marginTop: 8 }}>
              <input
                type="text"
                value={window.location.href}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px 0 0 6px',
                  outline: 'none'
                }}
              />
              <Button
                type="primary"
                onClick={() => copyToClipboard(window.location.href)}
                style={{ borderRadius: '0 6px 6px 0' }}
              >
                Sao chép
              </Button>
            </div>
          </div>

          <div>
            <Text strong>Chia sẻ qua mạng xã hội:</Text>
            <div style={{ marginTop: 8 }}>
              <Space>
                <Button
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}
                  style={{ background: '#1877f2', color: 'white', border: 'none' }}
                >
                  Facebook
                </Button>
                <Button
                  onClick={() => window.open(`https://zalo.me/share?url=${encodeURIComponent(window.location.href)}`)}
                  style={{ background: '#0068ff', color: 'white', border: 'none' }}
                >
                  Zalo
                </Button>
              </Space>
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default FacilityDetailPage;
