import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import QuickActions from './components/QuickActions';
import HomePage from './pages/HomePage';
import FacilitiesPage from './pages/FacilitiesPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';

const { Content } = Layout;

function AppContent() {
    // Phat hien kich thuoc man hinh <= 768px = dien thoai
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();

    // Check if current route should hide sidebar (login/register pages)
    const hideSidebar = ['/login', '/register'].includes(location.pathname);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth <= 768) {
                // An sidebar
                setSidebarCollapsed(true);
            }
        };
        // Check ngay khi load
        checkMobile();
        window.addEventListener('resize', checkMobile); // Check lai khi thay doi kich thuoc
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (hideSidebar) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Routes>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
            <Layout>
                {!isMobile && <Sidebar collapsed={sidebarCollapsed} />}
                <Layout style={{
                    padding: isMobile ? '16px' : '24px',
                    marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 250)
                }}>
                    <Content
                        style={{
                            padding: isMobile ? 16 : 24,
                            margin: 0,
                            minHeight: 280,
                            background: '#fff',
                            borderRadius: '8px'
                        }}
                    >
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/facilities" element={<FacilitiesPage />} />
                            <Route path="/booking/:facilityId" element={<BookingPage />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/my-bookings" element={<div>Lịch đặt của tôi (Đang phát triển)</div>} />
                            <Route path="/chat" element={<div>Hỗ trợ AI (Đang phát triển)</div>} />
                        </Routes>
                    </Content>
                </Layout>
                {!hideSidebar && <QuickActions />}
            </Layout>
        </Layout>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;