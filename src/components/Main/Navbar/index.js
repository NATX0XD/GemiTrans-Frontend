import React, { useState } from 'react'
import MiniProfile from './MiniProfile'
import MenuNavber from './MenuNavber'
import LogoNavber from './LogoNavber'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="w-full px-4 sm:px-6 pb-0 py-4 bg-[#f8f9fb] relative z-50">
            <nav className="flex items-center justify-between w-full max-w-[1440px] mx-auto bg-white rounded-[2.5rem] px-4 py-2.5 shadow-sm border border-gray-100 relative">
                
                <div className="flex items-center gap-2 pr-2">
                  <button 
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 focus:outline-none rounded-full hover:bg-slate-100 transition-colors pointer-events-auto cursor-pointer border-0"
                  >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                  </button>
                  <LogoNavber />
                </div>
                
                {/* Desktop Menu */}
                <div className="hidden lg:flex flex-1 justify-center z-10">
                  <MenuNavber />
                </div>
                
                <MiniProfile />

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 p-4 bg-white rounded-3xl shadow-xl border border-gray-100 lg:hidden flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-300">
                    <MenuNavber isMobile />
                  </div>
                )}
            </nav>
        </div>
    )
}

export default Navbar