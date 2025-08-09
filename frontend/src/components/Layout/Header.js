import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Drawer, Switch, Tooltip } from 'antd';
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
import NotificationCenter from '../NotificationCenter';

const { Header: AntHeader } = Layout;

const Header = ({ onMenuToggle }) => {
    const navigate = useNavigate();
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const { isDarkMode, toggleDarkMode } = useTheme();

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                Thông tin cá nhân
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
                Cài đặt
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );

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

                    {/* Hiển thị khi đã đăng nhập */}
                    {/* <Dropdown overlay={userMenu} placement="bottomRight">
            <Avatar 
              style={{ backgroundColor: '#87d068', cursor: 'pointer' }} 
              icon={<UserOutlined />} 
            />
          </Dropdown> */}
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
          }
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