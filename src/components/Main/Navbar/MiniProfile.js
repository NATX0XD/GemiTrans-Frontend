import React, { useState, useRef, useEffect } from 'react';
import { Settings, MessageCircle, Bell, ChevronDown, LogOut } from 'lucide-react';
import { auth } from '../../../configuration/firebase';
import { signOut } from 'firebase/auth';
import SettingsModal from '../Modal/SettingsModal';

const MiniProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const user = auth.currentUser;
  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&bold=true&size=150`;
  const photoURL = user?.photoURL || fallbackAvatar;

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex items-center gap-3 pr-1">
        {/* Search Input removed per request */}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 mr-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-slate-500 hover:bg-slate-50 transition-colors border-0 outline-none cursor-pointer"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          {/* <button className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-slate-500 hover:bg-slate-50 transition-colors border-0 outline-none cursor-pointer">
          <MessageCircle className="w-[18px] h-[18px]" strokeWidth={2} />
        </button> */}
          <button className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-slate-500 hover:bg-slate-50 transition-colors relative border-0 outline-none cursor-pointer">
            <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
            {/* Notification Dot */}
            <span className="absolute top-[8px] right-[10px] w=[6px] h-[6px] p-[3px] bg-emerald-500 rounded-full border-[1.5px] border-white"></span>
          </button>
        </div>

        {/* User Dropdown Section */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-200/50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer outline-none"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200">
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="text-sm font-bold text-slate-700 max-w-[120px] truncate">{displayName}</span>
            <ChevronDown size={14} className="text-slate-400 ml-0.5" />
          </button>

          {isOpen && (
            <div className="absolute top-full mt-3 right-0 w-64 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 flex flex-col">

              {/* Header info */}
              <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 mb-1">
                <img src={photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200" referrerPolicy="no-referrer" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 truncate">{displayName}</span>
                  <span className="text-xs font-semibold text-slate-500 truncate">{email}</span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer outline-none border-0 text-sm font-semibold mt-1"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
}

export default MiniProfile