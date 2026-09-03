import React from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const TwoWayToggle = ({ enabled, onChange, infoText, disabled }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
          {t('live.twoWay')}
          <span aria-hidden="true" className="text-slate-400">
            <Info size={14} />
          </span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t('live.twoWay')}
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

      {/* Rendered inline rather than as a `title` tooltip: in browser two-way mode
          this sentence is the only thing telling the user which mic to press, and
          a touch device never surfaces a tooltip. */}
      {enabled && infoText && (
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{infoText}</p>
      )}
    </div>
  );
};

export default TwoWayToggle;
