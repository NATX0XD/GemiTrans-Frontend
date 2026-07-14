import React from 'react';
import { Clock, ChevronRight, Zap, ZapOff, BookOpen, Bell } from 'lucide-react';
import { useTranslation } from '../../../../context/LanguageContext';

const NotificationItem = ({ item, onClick }) => {
    const { type, title, message, date, icon, link } = item;
    const { t } = useTranslation();

    const getIcon = (iconName, type) => {
        const colorClass = type === 'danger' ? 'text-red-500' : type === 'warning' ? 'text-amber-500' : 'text-blue-500';
        switch (iconName) {
            case 'Zap': return <Zap size={16} className={colorClass} fill="currentColor" />;
            case 'ZapOff': return <ZapOff size={16} className={colorClass} />;
            case 'BookOpen': return <BookOpen size={16} className={colorClass} />;
            default: return <Bell size={16} className={colorClass} />;
        }
    };

    const bgClass = type === 'danger' ? 'bg-red-50 dark:bg-red-900/20' : 
                    type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20' : 
                    'bg-blue-50 dark:bg-blue-900/20';

    const titleClass = type === 'danger' ? 'text-red-600 dark:text-red-400' : 
                       type === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
                       'text-blue-600 dark:text-blue-400';

    return (
        <div
            onClick={onClick}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group relative overflow-hidden"
        >
            <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${bgClass}`}>
                    {getIcon(icon, type)}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-black uppercase tracking-tight ${titleClass}`}>
                            {title}
                        </h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <Clock size={10} /> {date}
                        </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                        {message}
                    </p>
                    {link && (
                        <div className="pt-2 flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-widest group-hover:gap-2 transition-all">
                            {t('notif.takeAction')} <ChevronRight size={10} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationItem;
