import React from 'react';
import { AlignLeft, Languages, Users } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const MODES = [
  { key: 'transcribe', icon: AlignLeft, enabled: false },
  { key: 'translate', icon: Languages, enabled: true },
  { key: 'dubbing', icon: Users, enabled: false },
];

const ModeTabs = ({ mode, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
      {MODES.map(({ key, icon: Icon, enabled }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            type="button"
            disabled={!enabled}
            title={enabled ? undefined : t('live.comingSoon')}
            onClick={() => enabled && onChange(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              active
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            } ${enabled ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200' : 'opacity-40 cursor-not-allowed'}`}
          >
            <Icon size={16} strokeWidth={2} />
            {t(`live.tabs.${key}`)}
          </button>
        );
      })}
    </div>
  );
};

export default ModeTabs;
