import React from 'react'
import { Link } from 'react-router-dom'

const LogoNavber = () => {
  return (
    <Link to="/" className="flex items-center gap-2 pl-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#2A2B3D] dark:bg-indigo-600 shadow-sm transition-colors duration-500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.91L22 12L15.09 15.09L12 22L8.91 15.09L2 12L8.91 8.91L12 2Z" fill="white" />
        </svg>
      </div>
      <span className="text-[1.15rem] font-bold text-slate-800 dark:text-slate-50 tracking-tight transition-all duration-500 dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">{process.env.REACT_APP_NAME || "GEMITRANS"}</span>
    </Link>
  )
}

export default LogoNavber