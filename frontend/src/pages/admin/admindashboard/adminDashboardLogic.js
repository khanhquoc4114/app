// Tách logic dashboard admin ra khỏi UI
import { message, Modal } from 'antd';

// Xử lý thêm mới sân
export function handleAddFacility(setSelectedFacility, setFacilityModalVisible) {
    setSelectedFacility(null);
    setFacilityModalVisible(true);
}

// Xử lý sửa sân
export function handleEditFacility(record, setSelectedFacility, setFacilityModalVisible) {
    setSelectedFacility(record);
    setFacilityModalVisible(true);
}

// Xử lý xóa sân
export function handleDeleteFacility(record) {
    Modal.confirm({
        title: 'Xác nhận xóa sân',
        content: `Bạn có chắc muốn xóa sân "${record.name}"?`,
        onOk: () => {
            message.success(`Đã xóa sân ${record.name}`);
        }
    });
}

// Xử lý khóa/mở khóa user
export function handleToggleUserStatus(record) {
    const action = record.is_active ? 'khóa' : 'mở khóa';
    message.success(`Đã ${action} tài khoản ${record.username}`);
}
