import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Main/Navbar'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-slate-950 flex flex-col overflow-x-hidden transition-colors duration-500">
      <Navbar />
      <main className="flex-1 w-full">
        {/* Child pages (like HomePage) will render here */}
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout