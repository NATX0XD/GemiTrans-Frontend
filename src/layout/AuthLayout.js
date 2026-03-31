import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Languages, Sparkles, Globe, BookMarked, History } from 'lucide-react'

const appName = process.env.REACT_APP_NAME || 'AI Workbench';

const AuthLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-slate-50/50 dark:bg-slate-950 transition-colors duration-700">
      
      {/* LEFT SIDE — Branding Banner (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 flex-col justify-between p-12">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-400/20 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>

        {/* Top — Logo */}
        <div className="relative z-10">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm text-white flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform duration-300">
              <Languages size={22} />
            </div>
            <span className="text-xl font-black tracking-tight text-white">{appName}</span>
          </div>
        </div>

        {/* Center — Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm text-indigo-200 text-xs font-bold uppercase tracking-widest mb-8 w-max">
            <Sparkles size={14} className="text-indigo-300" />
            <span>Next-Gen Translation AI</span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15] mb-6">
            Break language barriers{' '}
            <span className="text-indigo-200">with zero friction.</span>
          </h2>
          
          <p className="text-lg text-indigo-200/80 font-medium leading-relaxed mb-10">
            A premium workspace designed for professionals to seamlessly translate, organize, and reference multi-lingual content in real-time.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <Globe size={18} />, text: '50+ Languages Supported' },
              { icon: <BookMarked size={18} />, text: 'Save & Organize Translations' },
              { icon: <History size={18} />, text: 'Full Translation History' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/5 shrink-0">
                  {item.icon}
                </div>
                <span className="text-sm font-semibold">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — Copyright */}
        <div className="relative z-10">
          <p className="text-xs font-medium text-indigo-300/50">
            &copy; {new Date().getFullYear()} {appName}. All rights reserved.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-8 px-6 md:px-12 bg-white">
        <Outlet />
      </div>

    </div>
  )
}

export default AuthLayout