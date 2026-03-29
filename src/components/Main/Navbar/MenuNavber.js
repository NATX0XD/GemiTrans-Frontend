import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { navItems } from '../../../configuration/navItems';



const MenuNavber = ({ isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`flex gap-1 ${isMobile ? 'flex-col w-full' : 'items-center hidden lg:flex'}`}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex items-center ${isMobile ? 'w-full px-6 py-4 justify-start' : 'gap-2.5 px-4 py-2.5'} text-sm font-semibold transition-all rounded-full outline-none cursor-pointer border-0 ${isActive
              ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
              : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-900/40'
              }`}
          >
            {item.icon}
            {isMobile ? <span className="ml-3">{item.name}</span> : item.name}
          </button>
        )
      })}
    </div>
  )
}

export default MenuNavber