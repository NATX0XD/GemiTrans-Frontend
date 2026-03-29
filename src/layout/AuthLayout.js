import React from 'react'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950 transition-colors duration-700">
      <Outlet />
    </div>
  )
}

export default AuthLayout