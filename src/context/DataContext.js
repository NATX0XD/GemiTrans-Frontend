import React, { createContext, useContext, useState } from 'react'

const Context = createContext()

export const DataProvider = ({ children }) => {
    // Boilerplate for future global state (e.g. Translation History, Favorites)
    const [globalState, setGlobalState] = useState({})

    return (
        <Context.Provider value={{ globalState, setGlobalState }}>
            {children}
        </Context.Provider>
    )
}

export const useData = () => useContext(Context)