import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Input } from '@heroui/react';
import { Search, Check, Globe, X } from 'lucide-react';
import { availableLanguages } from '../../../configuration/availableLanguages';



const LanguageSelectorModal = ({ isOpen, onClose, activeCardId, currentLang, onSelectLanguage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredLanguages = availableLanguages.filter(lang =>
    lang.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedLanguages = filteredLanguages.reduce((acc, lang) => {
    if (!acc[lang.category]) acc[lang.category] = [];
    acc[lang.category].push(lang);
    return acc;
  }, {});

  const handleSelect = (langValue) => {
    if (activeCardId && onSelectLanguage) {
      onSelectLanguage(activeCardId, langValue);
    }
    setSearchTerm('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setSearchTerm('');
      onClose();
    }
  };

  const modalContent = (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="relative w-full max-w-[420px] max-h-[80vh] mx-4 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Select Language</h2>
          <button
            onClick={() => { setSearchTerm(''); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border-0 cursor-pointer outline-none"
          >
            <X size={16} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3">
          <Input
            autoFocus
            placeholder="Search languages..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<Search size={16} className="text-slate-400 dark:text-slate-600" />}
            variant="flat"
            classNames={{
              input: "text-sm placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600",
              inputWrapper: "h-12 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 focus-within:!bg-slate-100 dark:focus-within:!bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700 data-[focus=true]:!shadow-none data-[focus=true]:!ring-0 data-[focus=true]:!border-slate-300 dark:data-[focus=true]:!border-slate-600 transition-all"
            }}
          />
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar" style={{ maxHeight: '400px' }}>
          <div className="flex flex-col gap-4">
            {Object.keys(groupedLanguages).map(category => (
              <div key={category} className="flex flex-col gap-1">
                {/* Category Header */}
                <div className="px-3 py-2 flex items-center gap-3">
                  <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{category}</span>
                  <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800"></div>
                </div>
                {/* Category Items */}
                {groupedLanguages[category].map((lang) => {
                  const isSelected = currentLang === lang.value;
                  return (
                    <button
                      key={lang.value}
                      onClick={() => handleSelect(lang.value)}
                      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all border-0 cursor-pointer text-left ${isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold'
                          : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium'
                        }`}
                    >
                      <span className="text-sm">{lang.label}</span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredLanguages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Globe size={32} className="mb-3 text-slate-300 dark:text-slate-700" />
                <span className="text-slate-500 dark:text-slate-600 font-medium text-sm">No languages found</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Use React Portal to render at document.body level
  return ReactDOM.createPortal(modalContent, document.body);
};

export default LanguageSelectorModal;
