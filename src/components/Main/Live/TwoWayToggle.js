import React from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const TwoWayToggle = ({ enabled, onChange, infoText, disabled }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {t('live.twoWay')}
        <span title={infoText} className="text-slate-400 cursor-help">
          <Info size={14} />
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
};

export default TwoWayToggle;
