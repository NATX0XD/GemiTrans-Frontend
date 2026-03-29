import React from 'react';
import ReactDOM from 'react-dom';
import { X, Copy, Check, ArrowRight, Quote, History, Bookmark, Volume2 } from 'lucide-react';
import { speakText } from '../../../services/speechService';

const TranslationDetailModal = ({ isOpen, onClose, item, onCopy, copiedId, variant = 'history' }) => {
  if (!isOpen || !item) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isHistory = variant === 'history';
  const themeClass = isHistory 
    ? {
        bg: 'from-indigo-50/50',
        bgAccent: 'bg-indigo-50/80',
        text: 'text-indigo-700',
        textMute: 'text-indigo-400',
        border: 'border-indigo-100/50',
        btn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25',
        icon: isHistory ? <History size={18} /> : <Bookmark size={18} />,
        label: isHistory ? 'History Record' : 'Saved Word'
      }
    : {
        bg: 'from-amber-50/50',
        bgAccent: 'bg-amber-50/80',
        text: 'text-amber-700',
        textMute: 'text-amber-400',
        border: 'border-amber-100/50',
        btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25',
        icon: <Bookmark size={18} />,
        label: 'Saved Word'
      };

  const modalContent = (
    <div 
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-[95%] max-w-5xl bg-white rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300 h-[80vh] md:h-[70vh]"
      >
        {/* Modern Background Accents */}
        <div className={`absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br ${themeClass.bg} to-transparent pointer-events-none z-0`}></div>
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header Area */}
          <div className="px-6 md:px-10 pt-6 pb-2 flex items-center justify-between border-b border-slate-50">
            <div className="flex items-center gap-4">
               <div className={`flex items-center gap-3 px-4 py-2 ${themeClass.bgAccent} rounded-2xl border ${themeClass.border} shadow-sm`}>
                  <div className={themeClass.text}>{themeClass.icon}</div>
                  <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${themeClass.text}`}>{themeClass.label}</span>
               </div>
               
               <div className={`hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 ${themeClass.bgAccent} ${themeClass.text} rounded-xl border ${themeClass.border} shadow-sm`}>
                  <span>{item.sourceLang || 'Auto'}</span>
                  <ArrowRight size={10} className={themeClass.textMute} />
                  <span>{item.targetLang}</span>
               </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-all border-none cursor-pointer outline-none shadow-sm active:scale-90"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area - Side by Side on Desktop */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Source Section (Left) */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-0 pb-5 custom-scrollbar border-b md:border-b-0 md:border-r border-slate-50 relative group/src">
              <div className="sticky top-0 bg-white/95 backdrop-blur-md py-1 mb-2 z-10 flex items-center gap-2">
                <Quote size={12} className="text-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Original Text</span>
              </div>
              <p className="text-base text-slate-600 leading-relaxed whitespace-pre-wrap font-medium select-all">
                {item.sourceText}
              </p>
            </div>

            {/* Target Section (Right) */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 pt-0 pb-5 custom-scrollbar relative group/target">
              <div className={`sticky top-0 ${themeClass.bg} backdrop-blur-md py-1 mb-2 z-10 flex items-center justify-between ${themeClass.bgAccent}`}>
                 <div className="flex items-center gap-2">
                   <button 
                    onClick={() => speakText(item.translatedText, item.targetLang)}
                    className={`px-3 h-8 rounded-lg ${themeClass.btn} text-white transition-all duration-300 flex items-center justify-center border-none cursor-pointer shadow-lg active:scale-95`}
                    title="Listen"
                  >
                    <Volume2 size={14} />
                  </button>
                   <span className={`text-[10px] font-black ${themeClass.textMute} uppercase tracking-[0.2em]`}>Translated Result</span>
                 </div>
                 <button 
                  onClick={() => onCopy(item.translatedText, item.id)}
                  className={`px-4 h-8 rounded-lg ${themeClass.btn} text-white transition-all duration-300 flex items-center gap-2 border-none cursor-pointer shadow-lg active:scale-95`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check size={14} />
                      <span className="text-[10px] font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className="text-[10px] font-bold tracking-wide">Copy</span>
                    </>
                  )}
                </button>
              </div>
              
              <div>
                <p className={`text-lg text-slate-900 leading-relaxed whitespace-pre-wrap font-bold select-all`}>
                  {item.translatedText}
                </p>
              </div>

              {/* Minimal Info Footer */}
              <div className="mt-8 pt-4 border-t border-slate-50 flex items-center gap-4 opacity-40">
                  <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Tone:</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">{item.objective}</span>
                  </div>
                  <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Formality:</span>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-600">{item.formality}%</span>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default TranslationDetailModal;
