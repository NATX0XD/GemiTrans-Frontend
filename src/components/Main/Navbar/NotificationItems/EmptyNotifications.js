import React from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from '../../../../context/LanguageContext';

const EmptyNotifications = () => {
    const { t } = useTranslation();
    return (
        <div className="py-12 px-6 flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Bell size={24} className="text-slate-400" />
            </div>
            <h5 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest mb-1">
                {t('notif.emptyTitle')}
            </h5>
            <p className="text-xs font-semibold text-slate-500">
                {t('notif.emptyHint')}
            </p>
        </div>
    );
};

export default EmptyNotifications;
