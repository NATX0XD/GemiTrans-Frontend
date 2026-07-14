import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../../../hooks/useNotifications';
import NotificationItem from './NotificationItems/NotificationItem';
import EmptyNotifications from './NotificationItems/EmptyNotifications';
import { useTranslation } from '../../../context/LanguageContext';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { notifications, hasUnread } = useNotifications();
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleItemClick = (item) => {
        if (item.link) {
            navigate(item.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-0 outline-none cursor-pointer bg-transparent ${isOpen ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
            >
                <Bell className={`w-[18px] h-[18px] ${isOpen ? 'text-indigo-500' : ''}`} strokeWidth={2} />
                {hasUnread && (
                    <span className="absolute top-[8px] right-[10px] w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white dark:border-slate-900 animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full mt-3 right-0 w-80 md:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 overflow-hidden z-50 origin-top-right font-sans"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                                {t('notif.title')}
                                {notifications.length > 0 && (
                                    <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-md font-black">
                                        {notifications.length}
                                    </span>
                                )}
                            </h3>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                                    {notifications.map((notif) => (
                                        <NotificationItem 
                                            key={notif.id} 
                                            item={notif} 
                                            onClick={() => handleItemClick(notif)} 
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyNotifications />
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                     GemiTrans
                                </span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
