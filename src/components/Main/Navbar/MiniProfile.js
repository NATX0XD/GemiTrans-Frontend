import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, ChevronDown, LogOut, Sparkles } from 'lucide-react';
import { auth } from '../../../configuration/firebase';
import { signOut } from 'firebase/auth';
import SettingsModal from '../Modal/SettingsModal';
import QuotaMiniBar from '../Quota/QuotaMiniBar';
import NotificationDropdown from './NotificationDropdown';
import { useTranslation } from '../../../context/LanguageContext';

const MiniProfile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t, lang, setLang } = useTranslation();

  const user = auth.currentUser;
  const displayName = user?.displayName || t('profile.user');
  const shortName = displayName.split(' ')[0]; // Gets only the first name
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
      <div className="flex items-center gap-1.5 sm:gap-3 pr-1">
        {/* Search Input removed per request */}

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:mr-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-0 outline-none cursor-pointer bg-transparent"
          >
            <Settings className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <NotificationDropdown />
        </div>

        {/* User Dropdown Section */}
        <div className="relative" ref={dropdownRef}>
            <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer outline-none bg-transparent"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
              <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span className="hidden sm:block text-sm font-bold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">{shortName}</span>
            <ChevronDown size={14} className="text-slate-400 ml-0.5 hidden sm:block" />
          </button>

          {isOpen && (
            <div className="absolute top-full mt-3 right-0 w-64 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-800 p-2 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200">

              {/* Header info */}
              <div className="flex items-center gap-3 px-3 py-3 border-b border-slate-100 dark:border-slate-800 mb-1">
                <img src={photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{shortName}</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">{email}</span>
                </div>
              </div>

              {/* Token Quota Display */}
              <QuotaMiniBar />

              {/* Language Switch */}
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl mb-1">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('profile.language')}</span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5">
                  {['en', 'th'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setLang(code)}
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-colors cursor-pointer border-0 outline-none ${lang === code ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                    >
                      {code === 'en' ? 'EN' : 'ไทย'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upgrade Plan */}
              <Link 
                to="/pricing"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer outline-none border-0 text-sm font-bold no-underline group mb-1"
              >
                <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                {t('profile.upgradePlan')}
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors cursor-pointer outline-none border-0 text-sm font-semibold mt-1 bg-transparent"
              >
                <LogOut size={16} />
                {t('profile.signOut')}
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