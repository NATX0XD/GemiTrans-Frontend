import React, { createContext, useContext, useState, useEffect } from 'react'

const Context = createContext()

export const DataProvider = ({ children }) => {
    // Theme state (light/dark)
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });

    // Handle theme changes
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    // Boilerplate for future global state (e.g. Translation History, Favorites)
    const [globalState, setGlobalState] = useState({})

    return (
        <Context.Provider value={{ theme, setTheme, globalState, setGlobalState }}>
            {children}
        </Context.Provider>
    )
}

export const useData = () => useContext(Context)