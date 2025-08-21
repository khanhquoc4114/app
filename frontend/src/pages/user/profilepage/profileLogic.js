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
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8000/api/auth/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                old_password: values.old_password,
                new_password: values.new_password
            })
        });

        if (res.ok) {
            message.success("Đổi mật khẩu thành công!");
            passwordForm.resetFields();
        } else {
            const errData = await res.json();
            let errorMsg = "Lỗi khi đổi mật khẩu";

            if (typeof errData.detail === "string") {
                errorMsg = errData.detail;
            } else if (Array.isArray(errData) && errData.length > 0) {
                // Lấy message đầu tiên từ list error
                errorMsg = errData[0].msg;
            }

            message.error(errorMsg);
        }
    } catch (error) {
        message.error("Có lỗi xảy ra, vui lòng thử lại!");
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
