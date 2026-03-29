import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@heroui/react';

const AppearanceSettings = ({ theme, setTheme }) => {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800 text-amber-400' : 'bg-white text-amber-500'} shadow-sm border border-slate-100 transition-colors`}>
            {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 uppercase tracking-widest">App Theme Color</p>
            <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tight">Currently using: {theme} Mode</p>
          </div>
        </div>
        <Switch
          isSelected={theme === 'dark'}
          onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
          size="lg"
          color="primary"
          classNames={{
            wrapper: "bg-slate-200 group-data-[selected=true]:bg-indigo-500",
            thumb: "bg-white shadow-md border-2 border-transparent group-data-[selected=true]:border-indigo-500"
          }}
          startContent={<Moon />}
          endContent={<Sun />}
        />
      </div>
    </section>
  );
};

export default AppearanceSettings;
