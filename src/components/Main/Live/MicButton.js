import React from 'react';
import { Mic, Square } from 'lucide-react';

// `size` is 'lg' for the single shared mic and 'sm' for the paired per-speaker
// buttons used by two-way browser mode.
const MicButton = ({ state, label, onClick, disabled, size = 'lg' }) => {
  const listening = state === 'listening';
  const dimensions = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 32 : 22;

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-teal-600 dark:text-teal-400">
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        aria-pressed={listening}
        disabled={disabled}
        onClick={onClick}
        className={`${dimensions} rounded-full flex items-center justify-center text-white shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          listening
            ? 'bg-rose-600 shadow-rose-500/40 animate-pulse'
            : 'bg-rose-500 shadow-rose-500/30 hover:scale-105 active:scale-95'
        }`}
      >
        {listening ? <Square size={iconSize - 4} fill="currentColor" /> : <Mic size={iconSize} />}
      </button>
    </div>
  );
};

export default MicButton;
