import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Drawer, Tooltip } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    MenuOutlined,
    SunOutlined,
    MoonOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../NotificationCenter';

const { Header: AntHeader } = Layout;

const Header = ({ onMenuToggle }) => {
    const navigate = useNavigate();
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    const mobileMenuItems = [
        { key: '/', label: 'Trang chủ' },
        { key: '/facilities', label: 'Danh sách sân' },
        { key: '/my-bookings', label: 'Lịch đặt của tôi' },
        { key: '/chat', label: 'Hỗ trợ AI' },
        { key: '/admin', label: 'Quản trị' },
    ];

    return (
        <>
            <AntHeader style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileMenuVisible(true)}
                        style={{
                            color: 'white',
                            display: 'none'
                        }}
                        className="mobile-menu-btn"
                    />
                    <div
                        className="header-title"
                        style={{
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/')}
                    >
                        🏟️ <span className="header-title-text">Quản lý sân thể thao</span>
                    </div>
                </div>

                <div
                    className="header-buttons"
                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                    <Tooltip title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
                        <Button
                            type="text"
                            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
                            onClick={toggleDarkMode}
                            style={{ color: 'white' }}
                        />
                    </Tooltip>

                    <NotificationCenter />

                    {isAuthenticated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: 'white' }}>
                                Xin chào, {user?.full_name || user?.username}
                            </span>
                            <Dropdown
                                menu={{ items: userMenuItems }}
                                placement="bottomRight"
                            >
                                <Avatar
                                    style={{ backgroundColor: '#87d068', cursor: 'pointer' }}
                                    icon={<UserOutlined />}
                                />
                            </Dropdown>
                        </div>
                    ) : (
                        <>
                            <Button
                                type="primary"
                                ghost
                                onClick={() => navigate('/login')}
                                size="small"
                            >
                                Đăng nhập
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => navigate('/register')}
                                size="small"
                            >
                                Đăng ký
                            </Button>
                        </>
                    )}
                </div>
            </AntHeader>

            {/* Mobile Menu Drawer */}
            <Drawer
                title="Menu"
                placement="left"
                onClose={() => setMobileMenuVisible(false)}
                open={mobileMenuVisible}
                width={280}
                bodyStyle={{ padding: 0 }}
            >
                <Menu
                    mode="vertical"
                    items={mobileMenuItems.map(item => ({
                        key: item.key,
                        label: item.label,
                        onClick: () => {
                            navigate(item.key);
                            setMobileMenuVisible(false);
                        }
                    }))}
                    style={{ border: 'none' }}
                />
            </Drawer>

            <style jsx>{`
                @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: inline-flex !important;
                    .header-title-text {
                }
                
                @media (max-width: 576px) {
                    .header-title-text {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
};

export default Header;