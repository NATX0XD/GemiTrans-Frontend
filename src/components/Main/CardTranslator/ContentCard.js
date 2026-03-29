import React from 'react';

const ContentCard = ({ loading, resultText }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 border-[3px] border-indigo-100 dark:border-slate-800 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium animate-pulse">Translating...</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-3 pb-24">
          {resultText ? (
            <p className="text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-all transition-all duration-300">
              {resultText}
            </p>
          ) : (
            <p className="text-xl font-medium text-slate-300/80 dark:text-slate-700/60 leading-relaxed italic">
              Translation...
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentCard;