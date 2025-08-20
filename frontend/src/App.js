import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import viVN from 'antd/locale/vi_VN';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Common Pages
import LoginPage from './pages/common/LoginPage';
import HomePage from './pages/common/HomePage';
import FacilitiesPage from './pages/common/facilitipage/FacilitiesPage';
import ChatPage from './pages/common/chat/ChatPage';
import NotificationsPage from './pages/common/NotificationsPage';
import RegisterPage from './pages/common/RegisterPage';
import ForgotPasswordPage from './pages/common/ForgotPasswordPage';

// User Pages
import MyBookingsPage from './pages/user/bookingpage/MyBookingsPage';
import ProfilePage from './pages/user/profilepage/ProfilePage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard/StaffDashboard';
import MyFacilitiesPage from './pages/staff/MyFacilitiesPage/MyFacilitiesPage';

// Admin Pages
import AdminDashboard from './pages/admin/admindashboard/AdminDashboard';

// Set Vietnamese locale for dayjs
dayjs.locale('vi');

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Layout wrapper for authenticated pages
const LayoutWrapper = ({ children, userRole }) => {
    return (
        <MainLayout userRole={userRole}>
            {children}
        </MainLayout>
    );
};

// App Routes Component
const AppRoutes = () => {
    const { isAuthenticated, userRole } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/register"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />
                }
            />

            <Route
                path="/login"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                }
            />
            <Route
                path="/forgot"
                element={
                    isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />
                }
            />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <LayoutWrapper userRole={userRole}>
                            <HomePage />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/facilities"
                element={
                    <ProtectedRoute>
                        <LayoutWrapper userRole={userRole}>
                            <FacilitiesPage />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            {/* User Routes */}
            <Route
                path="/my-bookings"
                element={
                    <ProtectedRoute requiredRole="user">
                        <LayoutWrapper userRole={userRole}>
                            <MyBookingsPage />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        <LayoutWrapper userRole={userRole}>
                            <ChatPage />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <LayoutWrapper userRole={userRole}>
                            <ProfilePage />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/notifications"
                element={
                    <ProtectedRoute>
                        <LayoutWrapper userRole={userRole}>
                            <NotificationsPage />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            {/* Staff Routes */}
            <Route
                path="/staff"
                element={
                    <ProtectedRoute requiredRole="staff">
                        <LayoutWrapper userRole={userRole}>
                            <StaffDashboard />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/my-facilities"
                element={
                    <ProtectedRoute requiredRole="staff">
                        <LayoutWrapper userRole={userRole}>
                            <MyFacilitiesPage />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <LayoutWrapper userRole={userRole}>
                            <AdminDashboard />
                        </LayoutWrapper>
                    </ProtectedRoute>
                }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    useEffect(() => {
        // Chỉ hỏi quyền nếu chưa từng granted
        const locationStatus = localStorage.getItem('hasRequestedLocation');
        if (locationStatus !== 'granted' && 'geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                () => {
                    localStorage.setItem('hasRequestedLocation', 'granted');
                }
                // Nếu từ chối thì không lưu gì, để lần sau hỏi lại
            );
        }
    }, []);

    return (
        <ConfigProvider
            locale={viVN}
            theme={{
                token: {
                    colorPrimary: '#1890ff',
                    borderRadius: 8,
                    colorBgContainer: '#ffffff',
                },
                components: {
                    Card: {
                        borderRadius: 12,
                    },
                    Button: {
                        borderRadius: 8,
                    },
                    Input: {
                        borderRadius: 8,
                    },
                },
            }}
        >
            <AuthProvider>
                <Router>
                    <div className="App">
                        <AppRoutes />
                    </div>
                </Router>
            </AuthProvider>
        </ConfigProvider>
    );
}

export default App;