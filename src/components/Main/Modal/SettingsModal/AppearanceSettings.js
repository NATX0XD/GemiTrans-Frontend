import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@heroui/react';

const AppearanceSettings = ({ theme, setTheme }) => {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-500">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-800 text-amber-400 shadow-xl shadow-black/40 border-slate-700' : 'bg-white text-amber-500 border-slate-100 shadow-sm'} border transition-all duration-500`}>
            {theme === 'dark' ? <Moon size={24} /> : <Sun size={24} />}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">App Theme Color</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tight">Currently using: {theme} Mode</p>
          </div>
        </div>
        <Switch
          isSelected={theme === 'dark'}
          onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
          size="lg"
          color="primary"
          classNames={{
            wrapper: "bg-slate-200 dark:bg-slate-800 group-data-[selected=true]:bg-indigo-500 dark:group-data-[selected=true]:bg-indigo-600",
            thumb: "bg-white shadow-md border-2 border-transparent group-data-[selected=true]:border-indigo-500 dark:group-data-[selected=true]:border-indigo-600"
          }}
          startContent={<Moon className="text-white" />}
          endContent={<Sun className="text-slate-500" />}
        />
      </div>
    </section>
  );
};

export default AppearanceSettings;
