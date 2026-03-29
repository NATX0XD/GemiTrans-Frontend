import React from 'react';
import { Slider } from '@heroui/react';

const VoiceSettings = ({ voiceSettings, setVoiceSettings }) => {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-50/50 dark:bg-slate-950/20 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 space-y-10 focus-within:bg-slate-50 dark:focus-within:bg-slate-950/40 transition-colors">
        <div>
          <div className="flex justify-between items-center mb-6 pl-1">
            <div className="flex flex-col">
              <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Reading Speed</label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Adjust the narration playback rate</span>
            </div>
            <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-4 py-1.5 rounded-xl">{voiceSettings.speed.toFixed(1)}x</span>
          </div>
          <Slider
            size="md"
            step={0.1}
            maxValue={2.0}
            minValue={0.1}
            value={voiceSettings.speed}
            onChange={(val) => setVoiceSettings(prev => ({ ...prev, speed: val }))}
            className="w-full"
            color="success"
            classNames={{
              track: "dark:bg-slate-800",
              thumb: "dark:bg-indigo-400 dark:border-white/20 dark:shadow-indigo-900/40 shadow-lg "
            }}      
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-6 pl-1">
            <div className="flex flex-col">
              <label className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Voice Pitch</label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1">Change the frequency of the voice</span>
            </div>
            <span className="text-sm font-black text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm px-4 py-1.5 rounded-xl">{voiceSettings.pitch.toFixed(1)}</span>
          </div>
          <Slider
            size="md"
            step={0.1}
            maxValue={2.0}
            minValue={0.0}
            value={voiceSettings.pitch}
            onChange={(val) => setVoiceSettings(prev => ({ ...prev, pitch: val }))}
            className="w-full"
            color="secondary"
            classNames={{
              base: "gap-3",
              track: "h-3 bg-purple-100 dark:bg-slate-800",
              thumb: "bg-white dark:bg-purple-400 border-2 border-purple-500 dark:border-white/20 shadow-lg dark:shadow-purple-900/40"
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default VoiceSettings;
