import React, { useState, useEffect } from 'react';
import {
    Layout,
    Menu,
    Avatar,
    Dropdown,
    Space,
    Typography,
    Badge,
    Button,
    Drawer
} from 'antd';
import {
    HomeOutlined,
    ShopOutlined,
    CalendarOutlined,
    MessageOutlined,
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    BellOutlined,
    MenuOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import ChatBubble from '../ChatBubble/ChatBubble';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const MainLayout = ({ children, userRole = 'user' }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [currentUser, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch("http://localhost:8000/api/auth/me", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                const user = await res.json();
                setUserInfo(user);
                console.log("User info:", user);
            } else {
                console.error("Token không hợp lệ");
            }
        };

        fetchUser();
    }, []);

    const getMenuItems = () => {
        const commonItems = [
            {
                key: '/home',
                icon: <HomeOutlined />,
                label: 'Trang chủ'
            },
            {
                key: '/facilities',
                icon: <ShopOutlined />,
                label: 'Danh sách sân'
            }
        ];

        const userItems = [
            {
                key: '/my-bookings',
                icon: <CalendarOutlined />,
                label: 'Lịch đặt của tôi'
            }
        ];

        const hostItems = [
            {
                key: '/host',
                icon: <DashboardOutlined />,
                label: 'Dashboard'
            },
            {
                key: '/my-facilities',
                icon: <ShopOutlined />,
                label: 'Sân của tôi'
            }
        ];

        const adminItems = [
            {
                key: '/admin',
                icon: <DashboardOutlined />,
                label: 'Quản trị'
            }
        ];

        if (userRole === 'admin') {
            return [...commonItems, ...adminItems];
        } else if (userRole === 'host') {
            return [...commonItems, ...hostItems];
        } else {
            return [...commonItems, ...userItems];
        }
    };

    const handleMenuClick = ({ key }) => {
        navigate(key);
        setMobileDrawerVisible(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin cá nhân',
            onClick: () => navigate('/profile')
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt'
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout
        }
    ];

    const SidebarContent = () => (
        <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
        />
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                breakpoint="lg"
                collapsedWidth="0"
                width={220}
                className="desktop-sider"
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
                }}
            >
                <div style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '0' : '0 24px',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    {!collapsed ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ fontSize: '24px', marginRight: '8px' }}>🏸</div>
                            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                SportsFacility
                            </Title>
                        </div>
                    ) : (
                        <div style={{ fontSize: '24px' }}>🏸</div>
                    )}
                </div>
                <SidebarContent />
            </Sider>

            <Layout>
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    {/* Mobile menu button */}
                    <Button
                        type="text"
                        icon={<MenuOutlined />}
                        onClick={() => setMobileDrawerVisible(true)}
                        className="mobile-menu-button"
                        style={{ display: 'none' }}
                    />

                    {/* Logo for mobile */}
                    <div className="mobile-logo" style={{ display: 'none', alignItems: 'center' }}>
                        <div style={{ fontSize: '24px', marginRight: '8px' }}>🏸</div>
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                            SportsFacility
                        </Title>
                    </div>

                    <div style={{ flex: 1 }} />

                    <Space size="large">
                        <NotificationDropdown>
                            <BellOutlined
                                style={{ fontSize: '18px', cursor: 'pointer' }}
                            />
                        </NotificationDropdown>

                        <Dropdown
                            menu={{ items: userMenuItems }}
                            placement="bottomRight"
                            trigger={['click']}
                        >
                            <Space style={{ cursor: 'pointer' }} align="center">
                                <Avatar icon={<UserOutlined />} src={currentUser?.avatar} />
                                <div style={{
                                    textAlign: 'left',
                                    lineHeight: '1.2',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        marginBottom: '2px',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {currentUser?.full_name}
                                    </div>
                                    <Text type="secondary" style={{
                                        fontSize: '12px',
                                        lineHeight: '1',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {userRole === 'admin' ? 'Quản trị viên' :
                                            userRole === 'host' ? 'Nhân viên' : 'Khách hàng'}
                                    </Text>
                                </div>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content style={{
                    margin: '24px',
                    padding: '24px',
                    background: '#fff',
                    borderRadius: '8px',
                    minHeight: 'calc(100vh - 112px)'
                }}>
                    {children}
                </Content>
            </Layout>

            {/* Mobile Drawer */}
            <Drawer
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontSize: '24px', marginRight: '8px' }}>🏸</div>
                        <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                            SportsFacility
                        </Title>
                    </div>
                }
                placement="left"
                onClose={() => setMobileDrawerVisible(false)}
                open={mobileDrawerVisible}
                bodyStyle={{ padding: 0 }}
                width={280}
            >
                <SidebarContent />
            </Drawer>

            <style jsx>{`
                @media (max-width: 992px) {
                    .desktop-sider {
                        display: none !important;
                    }
                    .mobile-menu-button {
                        display: inline-flex !important;
                    }
                    .mobile-logo {
                        display: flex !important;
                    }
                }
                @media (min-width: 993px) {
                    .mobile-menu-button {
                        display: none !important;
                    }
                    .mobile-logo {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Chat Bubble - only show for users, not host/admin */}
            {userRole === 'user' && <ChatBubble />}
        </Layout >
    );
};

export default MainLayout;