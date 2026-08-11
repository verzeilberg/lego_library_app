import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@lego_library_theme';

export const lightColors = {
    background: '#f8f8f8',
    surface: '#ffffff',
    surfaceAlt: '#f0f0f0',
    text: '#333333',
    textSecondary: '#666666',
    textMuted: '#999999',
    textLight: '#ffffff',
    border: '#e1e1e1',
    borderDark: '#cccccc',
    borderInput: 'gray',
    primary: '#1f65ff',
    primaryLight: '#007bff',
    danger: '#dc3545',
    dangerLight: '#ff6b6b',
    success: '#28a745',
    warning: '#ffc107',
    star: '#f5b301',
    overlay: 'rgba(0,0,0,0.5)',
    overlayDark: 'rgba(0,0,0,0.9)',
    overlayLight: 'rgba(0,0,0,0.35)',
    headerBg: '#fe0000',
    tabActive: '#007bff',
    tabInactive: 'gray',
    inputBg: '#ffffff',
    inputBgAlt: 'rgba(149, 165, 166, 0.2)',
    cardShadow: '#000',
    disabled: '#cccccc',
    switchTrack: '#767577',
    switchThumb: '#f4f3f4',
    switchActive: '#3dd51e',
    switchTrackOn: '#349A20FF',
    statusMissing: 'red',
    statusBroken: 'orange',
    statusDiscoloured: '#b8860b',
    link: 'blue',
    iconActive: 'blue',
    iconInactive: 'gray',
    iconGreen: 'green',
    iconOrange: 'orange',
    iconRed: 'red',
    iconBlack: 'black',
    iconWhite: 'white',
    placeholder: '#777',
    sidebarBg: '#5a5a5a',
    modalOverlay: 'rgba(0,0,0,0.8)',
    divider: 'black',
    dot: 'black',
    headerTitle: '#fff',
    headerIcon: '#fff',
    closeButton: '#fff',
    pickerBg: '#f8f8f8',
    pickerText: '#000',
    cardBorder: 'transparent',
    accent: '#007AFF',
    toggleBg: 'rgba(0,0,0,0.5)',
};

export const darkColors = {
    background: '#121212',
    surface: '#1e1e1e',
    surfaceAlt: '#2a2a2a',
    text: '#e0e0e0',
    textSecondary: '#aaaaaa',
    textMuted: '#777777',
    textLight: '#ffffff',
    border: '#333333',
    borderDark: '#444444',
    borderInput: '#555555',
    primary: '#4d8cff',
    primaryLight: '#6ea8fe',
    danger: '#ff6b6b',
    dangerLight: '#ff6b6b',
    success: '#4caf50',
    warning: '#ffc107',
    star: '#f5b301',
    overlay: 'rgba(0,0,0,0.5)',
    overlayDark: 'rgba(0,0,0,0.9)',
    overlayLight: 'rgba(0,0,0,0.35)',
    headerBg: '#fe0000',
    tabActive: '#4d8cff',
    tabInactive: '#888888',
    inputBg: '#2a2a2a',
    inputBgAlt: 'rgba(255,255,255,0.08)',
    cardShadow: '#000000',
    disabled: '#555555',
    switchTrack: '#555555',
    switchThumb: '#cccccc',
    switchActive: '#4caf50',
    switchTrackOn: '#4caf50',
    statusMissing: '#ff6b6b',
    statusBroken: '#ffa726',
    statusDiscoloured: '#d4a574',
    link: '#6ea8fe',
    iconActive: '#4d8cff',
    iconInactive: '#666666',
    iconGreen: '#4caf50',
    iconOrange: '#ffa726',
    iconRed: '#ff6b6b',
    iconBlack: '#cccccc',
    iconWhite: '#ffffff',
    placeholder: '#888888',
    sidebarBg: '#333333',
    modalOverlay: 'rgba(0,0,0,0.9)',
    divider: '#444444',
    dot: '#cccccc',
    headerTitle: '#ffffff',
    headerIcon: '#ffffff',
    closeButton: '#ffffff',
    pickerBg: '#2a2a2a',
    pickerText: '#e0e0e0',
    cardBorder: '#333333',
    accent: '#4d8cff',
    toggleBg: 'rgba(0,0,0,0.6)',
};

const ThemeContext = createContext({
    isDark: false,
    colors: lightColors,
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        let cancelled = false;
        AsyncStorage.getItem(STORAGE_KEY).then((val) => {
            if (!cancelled && val === 'dark') setIsDark(true);
        });
        return () => { cancelled = true; };
    }, []);

    const toggleTheme = useCallback(() => {
        setIsDark((prev) => {
            const next = !prev;
            AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
            return next;
        });
    }, []);

    const value = useMemo(() => ({
        isDark,
        colors: isDark ? darkColors : lightColors,
        toggleTheme,
    }), [isDark, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
