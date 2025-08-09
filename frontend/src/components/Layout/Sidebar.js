import React from 'react';
import { Layout, Menu } from 'antd';
import {
    HomeOutlined,
    CalendarOutlined,
    ShopOutlined,
    UserOutlined,
    BarChartOutlined,
    MessageOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = ({ collapsed = false }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
        },
        {
            key: '/facilities',
            icon: <ShopOutlined />,
            label: 'Danh sách sân',
        },
        {
            key: '/my-bookings',
            icon: <CalendarOutlined />,
            label: 'Lịch đặt của tôi',
        },
        {
            key: '/chat',
            icon: <MessageOutlined />,
            label: 'Hỗ trợ AI',
        },
        {
            key: 'admin',
            icon: <BarChartOutlined />,
            label: 'Quản trị',
            children: [
                {
                    key: '/admin',
                    label: 'Dashboard',
                },
                {
                    key: '/admin/facilities',
                    label: 'Quản lý sân',
                },
                {
                    key: '/admin/users',
                    label: 'Quản lý người dùng',
                },
                {
                    key: '/admin/revenue',
                    label: 'Doanh thu',
                },
            ],
        },
    ];

    const handleMenuClick = ({ key }) => {
        navigate(key);
    };

    return (
        <Sider
            width={250}
            collapsedWidth={80}
            collapsed={collapsed}
            style={{
                background: '#fff',
                position: 'fixed',
                left: 0,
                top: 64,
                height: 'calc(100vh - 64px)',
                zIndex: 100,
                transition: 'all 0.2s'
            }}
            breakpoint="lg"
            collapsible
        >
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                style={{
                    height: '100%',
                    borderRight: 0,
                    paddingTop: '16px'
                }}
                items={menuItems}
                onClick={handleMenuClick}
                inlineCollapsed={collapsed}
            />
        </Sider>
    );
};

export default Sidebar;