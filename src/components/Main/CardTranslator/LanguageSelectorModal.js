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
        style={{
          width: '100%',
          maxWidth: '420px',
          maxHeight: '80vh',
          margin: '0 16px',
          backgroundColor: '#fff',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Select Language</h2>
          <button
            onClick={() => { setSearchTerm(''); onClose(); }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors border-0 cursor-pointer"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3">
          <Input
            autoFocus
            placeholder="Search languages..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<Search size={16} className="text-slate-400" />}
            variant="flat"
            classNames={{
              input: "text-sm placeholder:text-slate-400",
              inputWrapper: "h-12 bg-slate-100/50 hover:bg-slate-100 focus-within:!bg-slate-100 rounded-2xl border border-slate-200/50 data-[focus=true]:!shadow-none data-[focus=true]:!ring-0 data-[focus=true]:!border-slate-300"
            }}
          />
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ maxHeight: '400px' }}>
          <div className="flex flex-col gap-4">
            {Object.keys(groupedLanguages).map(category => (
              <div key={category} className="flex flex-col gap-1">
                {/* Category Header */}
                <div className="px-3 py-2 flex items-center gap-3">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">{category}</span>
                  <div className="flex-1 h-px bg-slate-100"></div>
                </div>
                {/* Category Items */}
                {groupedLanguages[category].map((lang) => {
                  const isSelected = currentLang === lang.value;
                  return (
                    <button
                      key={lang.value}
                      onClick={() => handleSelect(lang.value)}
                      className={`flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all border-0 cursor-pointer text-left ${isSelected
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'bg-transparent hover:bg-slate-50 text-slate-600 font-medium'
                        }`}
                    >
                      <span className="text-sm">{lang.label}</span>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-indigo-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredLanguages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-50">
                <Globe size={32} className="mb-3 text-slate-300" />
                <span className="text-slate-500 font-medium text-sm">No languages found</span>
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
