import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedAuth = localStorage.getItem('isAuthenticated');
        const storedRole = localStorage.getItem('userRole');

        if (storedAuth === 'true') {
            setIsAuthenticated(true);
            setUserRole(storedRole || 'user');
        }
        setLoading(false);
    }, []);

    const login = (role = 'user') => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', role);
        setIsAuthenticated(true);
        setUserRole(role);
    };

    const logout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setUserRole('user');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};