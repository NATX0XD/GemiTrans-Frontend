import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe2, MessageCircle, Zap } from 'lucide-react';

const demoData = {
    japanese: {
        label: 'Japanese',
        source: 'Could you explain this to me?',
        standard: 'これを説明してくれますか？', // Grammatically correct but very flat/direct
        tones: [
            {
                level: 'Casual',
                text: 'これ、教えてくれる？',
                context: 'Friends or family'
            },
            {
                level: 'Business',
                text: 'こちらについて、ご説明いただけますでしょうか？',
                context: 'Co-workers or clients'
            },
            {
                level: 'Honorific',
                text: '大変恐縮ですが、こちらについてご教示いただけますと幸いです。',
                context: 'Superior or formal proposal'
            }
        ]
    },
    thai: {
        label: 'Thai',
        source: 'I want to go to the meeting.',
        standard: 'ฉันต้องการไปประชุม', // Very robotic
        tones: [
            {
                level: 'Casual',
                text: 'เดี๋ยวไปเข้าประชุมก่อนนะ',
                context: 'Close colleagues'
            },
            {
                level: 'Business',
                text: 'ผม/ดิฉัน ขออนุญาตเข้าร่วมการประชุมในครั้งนี้ครับ/คะ',
                context: 'Professional setting'
            },
            {
                level: 'Formal',
                text: 'ใคร่ขอเรียนแจ้งความประสงค์ในการเข้าร่วมประชุมตามวาระดังกล่าว',
                context: 'Official correspondence'
            }
        ]
    }
};

const DemoSection = () => {
    const [selectedLang, setSelectedLang] = useState('japanese');
    const [toneIndex, setToneIndex] = useState(1); // Default to Business/Neutral

    const currentData = demoData[selectedLang];
    const currentTone = currentData.tones[toneIndex];

    return (
        <section id="demo" className="py-16 md:py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles size={12} />
                        <span>Try the Difference</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 md:mb-6 leading-tight">
                        Translation that understands <span className="text-indigo-600 font-black italic">context.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                        Standard translators give you words. We give you the right <span className="text-slate-900 font-bold underline decoration-indigo-400 underline-offset-4 font-black">tone</span> for every situation.
                    </p>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="flex flex-col lg:flex-row gap-6 md:gap-12 items-stretch"
                >
                    
                    {/* Left: Interactive Controls */}
                    <div className="flex-1 space-y-8">
                        {/* 1. Language Toggle */}
                        <div className="bg-slate-50 p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-slate-100 flex flex-col gap-6">
                            <div>
                                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 md:mb-2">Select Language</h3>
                                <p className="text-xs md:text-sm text-slate-500 font-medium mb-4">See how nuances change across languages.</p>
                                <div className="flex gap-2">
                                    {Object.keys(demoData).map(lang => (
                                        <button
                                            key={lang}
                                            onClick={() => setSelectedLang(lang)}
                                            className={`px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all duration-300 flex items-center gap-2 border-0 cursor-pointer ${
                                                selectedLang === lang 
                                                ? 'bg-slate-900 text-white shadow-lg' 
                                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                            }`}
                                        >
                                            <Globe2 size={14} className="md:w-4 md:h-4" />
                                            {demoData[lang].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 2. Tone Slider */}
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-base md:text-lg font-bold text-slate-900 mb-0.5 md:mb-1">Adjust Tone</h3>
                                        <p className="text-xs md:text-sm text-slate-500 font-medium">Switch between politeness levels.</p>
                                    </div>
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] md:text-xs font-black rounded-lg">
                                        {currentTone.level}
                                    </span>
                                </div>
                                
                                <div className="relative pt-2 px-1">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="2" 
                                        step="1"
                                        value={toneIndex}
                                        onChange={(e) => setToneIndex(parseInt(e.target.value))}
                                        className="w-full h-1.5 md:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between mt-3">
                                        {currentData.tones.map((t, idx) => (
                                            <span 
                                                key={idx}
                                                className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-colors ${idx === toneIndex ? 'text-indigo-600' : 'text-slate-400'}`}
                                            >
                                                {t.level}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/60 p-4 rounded-2xl border border-indigo-100/30 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <MessageCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-tight">Best for</p>
                                        <p className="text-sm font-semibold text-slate-700">{currentTone.context}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Comparison Card */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4 font-black">
                            <div className="p-4 md:p-6 rounded-3xl bg-white border border-slate-100 shadow-sm leading-tight">
                                <div className="flex items-center gap-1.5 mb-2 grayscale">
                                    <Globe2 size={12} className="text-slate-400" />
                                    <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Standard</span>
                                </div>
                                <p className="text-xs md:text-sm text-slate-400 font-medium line-through decoration-red-300 opacity-60">
                                    {currentData.standard}
                                </p>
                            </div>
                            <div className="p-4 md:p-6 rounded-3xl bg-indigo-600 border border-indigo-500 shadow-xl shadow-indigo-600/10 text-white relative overflow-hidden group">
                                <div className="flex items-center gap-1.5 mb-2 relative z-10">
                                    <Zap size={12} className="text-indigo-200 fill-indigo-200" />
                                    <span className="text-[8px] md:text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none">AI Workbench</span>
                                </div>
                                <p className="text-xs md:text-sm font-bold relative z-10 leading-tight">
                                    {currentTone.text}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Premium Preview Panel */}
                    <div className="flex-1 lg:max-w-md h-full">
                        <div className="h-full rounded-3xl md:rounded-[3rem] bg-slate-900 border border-slate-800 shadow-2xl p-1.5 md:p-2 relative flex flex-col min-h-[350px] md:min-h-[450px] overflow-hidden">
                            {/* Dashboard Header */}
                            <div className="h-10 md:h-14 flex items-center px-4 md:px-6 border-b border-slate-800/50 justify-between">
                                <div className="flex gap-1.5">
                                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-red-500/80"></div>
                                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-amber-500/80"></div>
                                    <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500/80"></div>
                                </div>
                                <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Preview</div>
                                <div className="w-4 md:w-6"></div>
                            </div>

                            {/* Content Body */}
                            <div className="p-6 md:p-10 flex-1 flex flex-col space-y-6 md:space-y-10">
                                {/* Input Area */}
                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                                            <span className="text-[10px] md:text-xs font-black">EN</span>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">Input</span>
                                    </div>
                                    <div className="pl-0.5 md:pl-1">
                                        <p className="text-xl md:text-2xl font-bold text-white leading-tight">
                                            "{currentData.source}"
                                        </p>
                                    </div>
                                </div>

                                {/* Divider Animation */}
                                <div className="relative">
                                    <div className="h-px bg-slate-800 w-full opacity-50"></div>
                                    <div className="absolute top-1/2 left-0 w-1.5 h-1.5 -translate-y-1/2 bg-indigo-500 rounded-full blur-[1px] animate-pulse"></div>
                                    <div className="absolute top-1/2 left-0 h-[1.5px] bg-indigo-500 w-0 animate-[shimmer_2s_infinite]"></div>
                                </div>

                                {/* Output Area */}
                                <div className="space-y-3 md:space-y-4 relative">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-indigo-900/50 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                                            <span className="text-[10px] md:text-xs font-black uppercase">{selectedLang.slice(0, 2)}</span>
                                        </div>
                                        <span className="text-[10px] md:text-xs font-black text-indigo-400 uppercase tracking-widest whitespace-nowrap">Refined — {currentTone.level}</span>
                                    </div>
                                    <div className="pl-0.5 md:pl-1">
                                        <p className="text-xl md:text-2xl font-black text-indigo-100 leading-tight transition-all duration-500">
                                            <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                                                {currentTone.text}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Glow */}
                            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-600/20 rounded-full blur-[60px] pointer-events-none"></div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Custom Animations */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes shimmer {
                    0% { width: 0%; left: 0%; opacity: 0; }
                    50% { width: 50%; opacity: 1; }
                    100% { width: 0%; left: 100%; opacity: 0; }
                }
            `}} />
        </section>
    );
};

export default DemoSection;
