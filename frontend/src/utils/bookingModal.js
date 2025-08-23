import React from 'react';
import { Modal, Form, DatePicker, Button, Space, Typography } from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;

export function BookingModal({
  open,
  onCancel,
  selectedFacility,
  selectedDate,
  selectedTimeSlots,
  bookedSlots,
  handleDateChange,
  handleTimeSlotChange,
  handleBookingSubmit,
  setSelectedTimeSlots,
  formatPrice
}) {
  if (!selectedFacility) return null;
  const slots = selectedFacility.available_slots || [];
  return (
    <Modal
      title={`Đặt sân: ${selectedFacility?.name}`}
      open={open}
      onCancel={() => {
        onCancel();
        setSelectedTimeSlots([]);
      }}
      footer={null}
      width={600}
    >
      <div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Thông tin sân:</Text>
          <div style={{ marginTop: 8 }}>
            <div>📍 {selectedFacility.location}</div>
            <div>🕐 {selectedFacility.opening_hours}</div>
            <div>💰 {formatPrice(selectedFacility.price_per_hour)}/giờ</div>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {slots.map(slot => {
                const facilityDateKey = `${selectedFacility.id}_${selectedDate.format('YYYY-MM-DD')}`;
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
                  Tổng tiền: {formatPrice(selectedTimeSlots.length * selectedFacility.price_per_hour)}
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
                onCancel();
                setSelectedTimeSlots([]);
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
