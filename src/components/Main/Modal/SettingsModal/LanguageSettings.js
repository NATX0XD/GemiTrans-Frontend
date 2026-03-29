import React, { useState } from 'react';
import { Globe, Search, X, Check, Sun } from 'lucide-react';
import { availableLanguages } from '../../../../configuration/availableLanguages';

const LanguageSettings = ({ defaultLanguages, toggleLanguage, removeLanguage }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = availableLanguages
    .filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col h-full space-y-4">
      {/* Selected Chips */}
      <div className="flex flex-wrap gap-2 min-h-[44px] bg-slate-50/50 p-3 rounded-2xl border border-dashed border-slate-200">
        {defaultLanguages.map(lang => (
          <span key={lang} className="flex items-center gap-1.5 bg-white border border-slate-100 text-indigo-700 px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all group">
            {lang}
            <X size={14} className="cursor-pointer text-indigo-300 group-hover:text-red-500 transition-colors" onClick={() => removeLanguage(lang)} />
          </span>
        ))}
        {defaultLanguages.length === 0 && <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider py-1 pl-1">No defaults selected (Max 3)</p>}
      </div>

      {/* Search bar for list */}
      <div className="relative flex items-center">
        <Search size={16} className="absolute left-4 text-slate-400 pointer-events-none" />
        <input 
          type="text"
          placeholder="Search to filter languages..."
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-none font-bold placeholder:text-slate-400/70"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 min-h-0 border border-slate-100 rounded-2xl overflow-hidden flex flex-col bg-slate-50/30">
        <div className="overflow-y-auto p-2 custom-scrollbar max-h-[280px]">
          {filteredLanguages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {filteredLanguages.map(lang => (
                <div 
                  key={lang.value}
                  onClick={() => toggleLanguage(lang.label)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all ${defaultLanguages.includes(lang.label) ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100' : 'hover:bg-white text-slate-700'}`}
                >
                  <span className="text-xs font-bold truncate max-w-[140px]">{lang.label}</span>
                  {defaultLanguages.includes(lang.label) ? (
                    <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-sm border border-indigo-200">
                      <Check size={10} strokeWidth={4} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-200 bg-white"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
               <Globe size={24} className="text-slate-200" />
               <p className="font-bold text-xs uppercase tracking-tight">No languages match your search</p>
             </div>
          )}
        </div>
      </div>

      {defaultLanguages.length >= 3 && (
        <div className="flex justify-center">
           <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest flex items-center gap-1.5 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 animate-pulse"><Sun size={12} className="text-amber-500"/> Select limit reached (3/3)</p>
        </div>
      )}
    </section>
  );
};

export default LanguageSettings;
