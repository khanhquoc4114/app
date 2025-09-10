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

const createFacility = async (facilityData) => {
  try {
    const fd = new FormData();

    const appendIf = (k, v) => {
      if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
    };

    const toFile = (item) => {
      console.log('toFile input:', item); // 🔍 Debug
      if (!item) return null;
      if (item instanceof File || item instanceof Blob) return item;
      if (item.originFileObj instanceof File || item.originFileObj instanceof Blob) {
        return item.originFileObj;
      }
      console.log('toFile: không tìm thấy file hợp lệ', item); // 🔍 Debug
      return null;
    };

    // Basic fields
    appendIf("name", facilityData.name);
    appendIf("price_per_hour", facilityData.price_per_hour);
    appendIf("description", facilityData.description);
    appendIf("location", facilityData.location);

    // CSV strings
    appendIf("sport_type", facilityData.sport_type);
    appendIf("amenities", facilityData.amenities);
    appendIf("opening_hours", facilityData.opening_hours);

    // court_layout
    if (facilityData.court_layout) {
      fd.append("court_layout", JSON.stringify(facilityData.court_layout));
    }

    // Ảnh cover
    const coverFile = toFile(facilityData.cover_image);
    if (coverFile) {
      fd.append("cover_image", coverFile);
    }

    // 🔍 Debug ảnh gallery
    const imgs = facilityData.images;
    console.log('facilityData.images:', imgs); // Debug
    console.log('imgs is Array:', Array.isArray(imgs)); // Debug
    console.log('imgs length:', imgs?.length); // Debug

    if (Array.isArray(imgs)) {
      console.log('Processing images array...'); // Debug
      imgs.forEach((item, index) => {
        console.log(`Processing image ${index}:`, item); // Debug
        const file = toFile(item);
        console.log(`Converted file ${index}:`, file); // Debug
        if (file) {
          console.log(`Appending facility_images ${index}:`, file.name || file); // Debug
          fd.append("facility_images", file);
        } else {
          console.warn(`Failed to convert image ${index} to file`); // Debug
        }
      });
    } else {
      console.warn('imgs is not an array:', typeof imgs); // Debug
    }

    // 🔍 Debug FormData contents
    console.log('FormData entries:');
    for (let [key, value] of fd.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    const headers = createAuthHeaders ? createAuthHeaders() : {};
    if (headers && headers["Content-Type"]) delete headers["Content-Type"];

    const resp = await fetch(`${API_BASE_URL}/api/facilities/`, {
      method: "POST",
      headers,
      body: fd,
    });

    if (!resp.ok) {
      const err = await safeReadJson(resp);
      throw new Error((err && err.detail) || `Lỗi khi tạo sân (HTTP ${resp.status})`);
    }
    return await resp.json();
  } catch (error) {
    console.error("Error creating facility:", error);
    throw error;
  }
};

async function safeReadJson(resp) {
  try { return await resp.json(); } catch { return null; }
}

// Hàm thêm/sửa sân
export const handleFacilitySubmit = async (
  values,
  setFacilities,
  setFacilityModalVisible,
  setSelectedFacility
) => {
  try {
    const hideLoading = message.loading(
      values.id ? "Đang cập nhật thông tin sân..." : "Đang tạo sân mới...",
      0
    );

    const result = values.id
      ? await updateFacility(values.id, values)
      : await createFacility(values);

    if (values.id) {
      setFacilities((prev) => prev.map((f) => (f.id === values.id ? { ...result } : f)));
      message.success(`Đã cập nhật thông tin sân ${result.name}`);
    } else {
      setFacilities((prev) => [...prev, result]);
      message.success(`Đã thêm sân mới ${result.name}`);
    }

    hideLoading();
    setFacilityModalVisible(false);
    setSelectedFacility(null);
  } catch (error) {
    console.error("Error in handleFacilitySubmit:", error);
    message.error(error.message || "Có lỗi xảy ra, vui lòng thử lại");
  }
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

// Hàm xử lý đổi trạng thái sân
export const handleChangeStatus = (id, status, setFacilities) => {
    setFacilities(prev => prev.map(fac => fac.id === id ? { ...fac, status } : fac));
    message.success('Cập nhật trạng thái sân thành công!');
};

export { createFacility, updateFacility, getMyFacilities };