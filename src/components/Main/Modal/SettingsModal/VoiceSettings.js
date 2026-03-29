import React from 'react';
import { Slider } from '@heroui/react';

const VoiceSettings = ({ voiceSettings, setVoiceSettings }) => {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-50/50 rounded-[2rem] p-8 border border-slate-100 space-y-10 focus-within:bg-slate-50 transition-colors">
        <div>
          <div className="flex justify-between items-center mb-6 pl-1">
            <div className="flex flex-col">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Reading Speed</label>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Adjust the narration playback rate</span>
            </div>
            <span className="text-sm font-black text-indigo-600 bg-white border border-slate-200 shadow-sm px-4 py-1.5 rounded-xl">{voiceSettings.speed.toFixed(1)}x</span>
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
              // base: "gap-3",
              // track: "h-3 bg-white ",
              // filler: "bg-gradient-to-r from-indigo-500 to-indigo-600",
              // thumb: "bg-white border-2 border-indigo-500 shadow-lg "
            }}      
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-6 pl-1">
            <div className="flex flex-col">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Voice Pitch</label>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Change the frequency of the voice</span>
            </div>
            <span className="text-sm font-black text-purple-600 bg-white border border-slate-200 shadow-sm px-4 py-1.5 rounded-xl">{voiceSettings.pitch.toFixed(1)}</span>
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
              track: "h-3 bg-purple-100",
              // filler: "bg-gradient-to-r from-purple-500 to-purple-600",
              thumb: "bg-white border-2 border-purple-500 shadow-lg "
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default VoiceSettings;
