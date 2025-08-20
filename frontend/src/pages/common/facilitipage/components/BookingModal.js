import React from 'react';
import { Modal, Form, DatePicker, Button, Space, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

const BookingModal = ({
    visible,
    onCancel,
    facility,
    selectedDate,
    onDateChange,
    selectedTimeSlots,
    onTimeSlotChange,
    bookedSlots,
    onBookingSubmit
}) => {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (!facility) return null;

    const facilityDateKey = `${facility.id}_${selectedDate.format('YYYY-MM-DD')}`;

    return (
        <Modal
            title={`Đặt sân: ${facility.name}`}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
        >
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
                            onChange={onDateChange}
                            style={{ width: '100%' }}
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

                    <Form.Item label="Chọn khung giờ" required>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                            {facility.available_slots.map(slot => {
                                const isBooked = bookedSlots[facilityDateKey]?.[slot] || false;
                                const isSelected = selectedTimeSlots.includes(slot);
                                const isPastTime = selectedDate.isSame(dayjs(), 'day') &&
                                    parseInt(slot.split(':')[0]) <= dayjs().hour();

                                return (
                                    <Button
                                        key={slot}
                                        type={isSelected ? 'primary' : 'default'}
                                        disabled={isBooked || isPastTime}
                                        onClick={() => onTimeSlotChange(slot)}
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
                            <Button 
                                type="primary" 
                                onClick={() => {
                                    console.log('BookingModal: Button clicked!');
                                    console.log('onBookingSubmit function:', onBookingSubmit);
                                    if (onBookingSubmit) {
                                        onBookingSubmit();
                                    } else {
                                        console.error('onBookingSubmit is not defined!');
                                    }
                                }}
                            >
                                Xác nhận đặt sân
                            </Button>
                            <Button onClick={onCancel}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

export default BookingModal;
