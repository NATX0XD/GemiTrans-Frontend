import React, { createContext, useContext, useState, useEffect } from 'react'

const Context = createContext()

export const DataProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const [globalState, setGlobalState] = useState({})

    return (
        <Context.Provider value={{ theme, setTheme, globalState, setGlobalState }}>
            {children}
        </Context.Provider>
    )
}

export const useData = () => useContext(Context)