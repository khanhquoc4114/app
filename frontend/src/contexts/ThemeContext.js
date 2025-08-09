import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConfigProvider, theme } from 'antd';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false;
    });

    const [primaryColor, setPrimaryColor] = useState(() => {
        return localStorage.getItem('primaryColor') || '#1890ff';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));

        // Apply dark mode to body for global styling
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            document.body.style.backgroundColor = '#141414';
            document.body.style.color = '#ffffff';
        } else {
            document.body.classList.remove('dark-mode');
            document.body.style.backgroundColor = '#ffffff';
            document.body.style.color = '#000000';
        }
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('primaryColor', primaryColor);

        // Apply primary color as CSS variable
        document.documentElement.style.setProperty('--primary-color', primaryColor);
    }, [primaryColor]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Ant Design v5 theme config
    const themeConfig = {
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: primaryColor,
            borderRadius: 8,
        },
    };

    return (
        <ThemeContext.Provider value={{
            isDarkMode,
            toggleDarkMode,
            primaryColor,
            setPrimaryColor,
            themeConfig
        }}>
            <ConfigProvider theme={themeConfig}>
                <div className={isDarkMode ? 'dark-theme' : 'light-theme'}>
                    {children}
                </div>
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};