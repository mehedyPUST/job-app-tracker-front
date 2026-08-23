// src/context/ThemeContext.jsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => { },
    setTheme: () => { },
});

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('dark');
    const [ready, setReady] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('theme');
            const initial =
                stored === 'light' || stored === 'dark'
                    ? stored
                    : window.matchMedia('(prefers-color-scheme: light)').matches
                        ? 'light'
                        : 'dark';
            setThemeState(initial);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(initial);
        } catch {
            document.documentElement.classList.add('dark');
        }
        setReady(true);
    }, []);

    const setTheme = useCallback((next) => {
        const value = next === 'light' ? 'light' : 'dark';
        setThemeState(value);
        try {
            localStorage.setItem('theme', value);
        } catch {
            /* ignore */
        }
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(value);
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    }, [theme, setTheme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, ready }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}