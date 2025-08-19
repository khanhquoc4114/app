// profileLogic.js - Chứa các hàm xử lý logic cho ProfilePage
import { message } from 'antd';

// Hàm xử lý cập nhật thông tin cá nhân
export const handleUpdateProfile = async (values, setLoading, setUserInfo, setEditing) => {
    setLoading(true);
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUserInfo(prev => ({ ...prev, ...values }));
        message.success('Cập nhật thông tin thành công!');
        setEditing(false);
    } catch (error) {
        message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
        setLoading(false);
    }
};

// Hàm xử lý đổi mật khẩu
export const handleChangePassword = async (values, setLoading, passwordForm) => {
    setLoading(true);
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        message.success('Đổi mật khẩu thành công!');
        passwordForm.resetFields();
    } catch (error) {
        message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
        setLoading(false);
    }
};

// Hàm xử lý upload avatar
export const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
        message.success('Cập nhật ảnh đại diện thành công!');
    } else if (info.file.status === 'error') {
        message.error('Tải ảnh thất bại!');
    }
};

// Hàm xử lý thay đổi cài đặt thông báo
export const handleNotificationChange = (key, value, setNotifications) => {
    setNotifications(prev => ({
        ...prev,
        [key]: value
    }));
    message.success('Cập nhật cài đặt thông báo thành công!');
};

// Hàm lấy màu cho cấp độ thành viên
export const getMemberLevelColor = (level) => {
    const colors = {
        Bronze: '#cd7f32',
        Silver: '#c0c0c0',
        Gold: '#ffd700',
        Platinum: '#e5e4e2'
    };
    return colors[level] || '#1890ff';
};
