const API_BASE_URL = 'http://localhost:8000/api';

// Helper function để gọi API
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Thêm token nếu có
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Có lỗi xảy ra');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

// Auth API
export const authAPI = {
    // Đăng nhập
    login: async (username, password) => {
        return apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    },

    // Đăng ký
    register: async (userData) => {
        const res = await fetch(`http://localhost:8000/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Đăng ký thất bại");
        }

        return res.json();
    },

    // Lấy thông tin user hiện tại
    getMe: async () => {
        return apiCall('/auth/me');
    },
};

// Facility API
export const facilityAPI = {
    // Lấy danh sách cơ sở thể thao
    getFacilities: async () => {
        return apiCall('/facilities', {
            method: 'GET',
        });
    },
};

export default apiCall;