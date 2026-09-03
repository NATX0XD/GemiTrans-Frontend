import React from 'react';
import { ChevronDown, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const LanguagePairBar = ({ langA, langB, onPickA, onPickB, onSwap, disabled }) => {
  const { t } = useTranslation();

  const pill = (lang, onPick) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className="flex-1 flex items-center justify-between gap-3 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
    >
      {lang}
      <ChevronDown size={16} className="text-slate-400" />
    </button>
  );

  return (
    <div className="w-full flex items-center gap-3">
      {pill(langA, onPickA)}
      <button
        type="button"
        aria-label={t('live.swap')}
        disabled={disabled}
        onClick={onSwap}
        className="shrink-0 w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-teal-600 transition-colors"
      >
        <ArrowLeftRight size={16} />
      </button>
      {pill(langB, onPickB)}
    </div>
  );
};

export default LanguagePairBar;
