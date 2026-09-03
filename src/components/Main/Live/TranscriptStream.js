import React from 'react';
import { RotateCw, Loader2 } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const TranscriptStream = ({ utterances, interimText, onRetry, emptyLabel }) => {
  const { t } = useTranslation();
  const isEmpty = utterances.length === 0 && !interimText;

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-y-auto flex flex-col gap-3 py-4">
      {utterances.map((utterance) => (
        <div
          key={utterance.id}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{utterance.sourceLang}</p>
          <p className="text-slate-700 dark:text-slate-200">{utterance.sourceText}</p>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wide text-teal-500 mb-1">{utterance.targetLang}</p>

            {utterance.status === 'pending' && (
              <p className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                {t('live.translating')}
              </p>
            )}

            {utterance.status === 'done' && (
              <p className="text-slate-900 dark:text-white font-medium">{utterance.translatedText}</p>
            )}

            {utterance.status === 'failed' && (
              <div className="flex items-center gap-3">
                <p className="text-rose-500 text-sm">{t('live.errors.translateFailed')}</p>
                <button
                  type="button"
                  onClick={() => onRetry(utterance.id)}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:underline"
                >
                  <RotateCw size={13} />
                  {t('live.retry')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {interimText && (
        <div
          data-testid="interim-text"
          className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-5 py-4 text-slate-400 italic"
        >
          {interimText}
        </div>
      )}
    </div>
  );
};

export default TranscriptStream;
