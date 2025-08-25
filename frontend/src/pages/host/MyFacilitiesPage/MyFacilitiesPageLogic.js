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


const API_BASE_URL = 'http://localhost:8000'; // Thay đổi theo URL backend của bạn

// Utility function to get token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Utility function to create headers with authorization
const createAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

const createFacility = async (facilityData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/facilities/`, {
            method: 'POST',
            headers: createAuthHeaders(),
            body: JSON.stringify(facilityData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Lỗi khi tạo sân');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating facility:', error);
        throw error;
    }
};

// Cập nhật thông tin sân
const updateFacility = async (facilityId, facilityData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/facilities/${facilityId}`, {
            method: 'PUT',
            headers: createAuthHeaders(),
            body: JSON.stringify(facilityData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Lỗi khi cập nhật sân');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating facility:', error);
        throw error;
    }
};

// Lấy danh sách sân của tôi
const getMyFacilities = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/facilities/my-facilities`, {
            method: 'GET',
            headers: createAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Lỗi khi lấy danh sách sân');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching my facilities:', error);
        throw error;
    }
};

// Hàm thêm/sửa sân
export const handleFacilitySubmit = async (values, setFacilities, setFacilityModalVisible, setSelectedFacility) => {
    try {
        // Hiển thị loading message
        const hideLoading = message.loading(
            values.id ? 'Đang cập nhật thông tin sân...' : 'Đang tạo sân mới...', 
            0
        );

        let result;

        if (values.id) {
            // Cập nhật sân hiện có
            result = await updateFacility(values.id, values);
            
            // Cập nhật state local
            setFacilities(prev => prev.map(fac => 
                fac.id === values.id ? { ...result } : fac
            ));
            
            // Hiển thị thông báo thành công
            hideLoading();
            message.success(`Đã cập nhật thông tin sân ${result.name}`);
        } else {
            // Tạo sân mới
            result = await createFacility(values);
            
            // Thêm sân mới vào state local
            setFacilities(prev => [...prev, result]);
            
            // Hiển thị thông báo thành công
            hideLoading();
            message.success(`Đã thêm sân mới ${result.name}`);
        }

        // Đóng modal và reset form
        setFacilityModalVisible(false);
        setSelectedFacility(null);
        
    } catch (error) {
        console.error('Error in handleFacilitySubmit:', error);
        
        // Hiển thị thông báo lỗi
        message.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
        
        // Không đóng modal để user có thể thử lại
    }
};

// Hàm tải lại danh sách sân từ server (optional, để đồng bộ dữ liệu)
export const refreshFacilities = async (setFacilities) => {
    try {
        const facilities = await getMyFacilities();
        setFacilities(facilities);
    } catch (error) {
        console.error('Error refreshing facilities:', error);
        message.error('Không thể tải danh sách sân');
    }
};

// Hàm đổi trạng thái sân
export const handleStatusSubmit = async (values, selectedFacility, setFacilities, setStatusModalVisible) => {
    try {
        const hideLoading = message.loading('Đang cập nhật trạng thái...', 0);
        
        const response = await fetch(`${API_BASE_URL}/facilities/${selectedFacility.id}/status`, {
            method: 'PATCH',
            headers: createAuthHeaders(),
            body: JSON.stringify({ is_active: values.is_active })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Lỗi khi cập nhật trạng thái');
        }

        // Cập nhật state local
        setFacilities(prev => prev.map(fac => 
            fac.id === selectedFacility.id 
                ? { ...fac, is_active: values.is_active }
                : fac
        ));

        hideLoading();
        message.success('Đã cập nhật trạng thái sân');
        setStatusModalVisible(false);
        
    } catch (error) {
        console.error('Error updating facility status:', error);
        message.error(error.message || 'Có lỗi khi cập nhật trạng thái');
    }
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

export { createFacility, updateFacility, getMyFacilities };