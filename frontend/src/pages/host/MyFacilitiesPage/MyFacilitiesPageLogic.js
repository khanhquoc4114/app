import { Modal, message } from 'antd';

// Lấy tên môn thể thao
export const getSportName = (sportType) => {
    const names = {
        badminton: 'Cầu lông',
        football: 'Bóng đá',
        tennis: 'Tennis',
        basketball: 'Bóng rổ'
    };
    return names[sportType] || sportType;
};

// Hàm format tiền
export const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
};

// Hàm xác nhận xóa sân
export const handleDeleteFacility = (record, setFacilities) => {
    Modal.confirm({
        title: 'Xác nhận xóa sân',
        content: `Bạn có chắc muốn xóa sân "${record.name}"? Hành động này không thể hoàn tác.`,
        okText: 'Xóa',
        cancelText: 'Hủy',
        okType: 'danger',
        onOk: () => {
            setFacilities(prev => prev.filter(fac => fac.id !== record.id));
            message.success(`Đã xóa sân ${record.name}`);
        }
    });
};

// Hàm thêm/sửa sân
export const handleFacilitySubmit = (values, setFacilities, setFacilityModalVisible, setSelectedFacility) => {
    if (values.id) {
        setFacilities(prev => prev.map(fac => fac.id === values.id ? { ...fac, ...values } : fac));
        message.success(`Đã cập nhật thông tin sân ${values.name}`);
    } else {
        setFacilities(prev => [
            ...prev,
            { ...values, id: Date.now(), key: Date.now() }
        ]);
        message.success(`Đã thêm sân mới ${values.name}`);
    }
    setFacilityModalVisible(false);
    setSelectedFacility(null);
};

// Hàm đổi trạng thái sân
export const handleStatusSubmit = (values, selectedFacility, setFacilities, setStatusModalVisible) => {
    setFacilities(prev => prev.map(fac => fac.id === selectedFacility.id ? { ...fac, status: values.status } : fac));
    message.success(`Đã cập nhật trạng thái sân ${selectedFacility.name}`);
    setStatusModalVisible(false);
};
// MyFacilitiesPageLogic.js - Chứa các hàm xử lý logic cho MyFacilitiesPage

// Hàm xử lý thêm mới hoặc cập nhật sân
export const handleSaveFacility = (values, setFacilities, setFacilityModalVisible, setSelectedFacility) => {
    setFacilities(prev => {
        if (values.id) {
            // Update
            return prev.map(fac => fac.id === values.id ? { ...fac, ...values } : fac);
        } else {
            // Add new
            return [
                ...prev,
                { ...values, id: Date.now(), key: Date.now() }
            ];
        }
    });
    setFacilityModalVisible(false);
    setSelectedFacility(null);
    message.success('Lưu thông tin sân thành công!');
};

// Hàm xử lý xoá sân

// Hàm xử lý đổi trạng thái sân
export const handleChangeStatus = (id, status, setFacilities) => {
    setFacilities(prev => prev.map(fac => fac.id === id ? { ...fac, status } : fac));
    message.success('Cập nhật trạng thái sân thành công!');
};
