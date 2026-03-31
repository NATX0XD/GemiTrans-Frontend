import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Languages, Sparkles } from 'lucide-react';

const translationPairs = [
    {
        sourceLang: 'English',
        targetLang: 'ไทย',
        sourceText: 'Hello, how are you today?',
        targetText: 'สวัสดี สบายดีไหมวันนี้?',
    },
    {
        sourceLang: 'English',
        targetLang: '日本語',
        sourceText: 'The weather is beautiful today.',
        targetText: '今日は天気がとても良いです。',
    },
    {
        sourceLang: 'English',
        targetLang: 'Français',
        sourceText: 'Thank you for your help!',
        targetText: 'Merci pour votre aide !',
    },
];

const HeroSection = () => {
    const navigate = useNavigate();
    const [pairIndex, setPairIndex] = useState(0);
    const [sourceDisplayed, setSourceDisplayed] = useState('');
    const [targetDisplayed, setTargetDisplayed] = useState('');
    const [phase, setPhase] = useState('typing-source'); // typing-source | translating | typing-target | paused

    const currentPair = translationPairs[pairIndex];

    const resetAndAdvance = useCallback(() => {
        setSourceDisplayed('');
        setTargetDisplayed('');
        setPairIndex(prev => (prev + 1) % translationPairs.length);
        setPhase('typing-source');
    }, []);

    useEffect(() => {
        let timer;

        if (phase === 'typing-source') {
            if (sourceDisplayed.length < currentPair.sourceText.length) {
                timer = setTimeout(() => {
                    setSourceDisplayed(currentPair.sourceText.slice(0, sourceDisplayed.length + 1));
                }, 60);
            } else {
                timer = setTimeout(() => setPhase('translating'), 400);
            }
        } else if (phase === 'translating') {
            timer = setTimeout(() => setPhase('typing-target'), 1500);
        } else if (phase === 'typing-target') {
            if (targetDisplayed.length < currentPair.targetText.length) {
                timer = setTimeout(() => {
                    setTargetDisplayed(currentPair.targetText.slice(0, targetDisplayed.length + 1));
                }, 60);
            } else {
                timer = setTimeout(() => setPhase('paused'), 2200);
            }
        } else if (phase === 'paused') {
            timer = setTimeout(resetAndAdvance, 300);
        }

        return () => clearTimeout(timer);
    }, [phase, sourceDisplayed, targetDisplayed, currentPair, resetAndAdvance]);

    return (
        <section className="relative pt-28 pb-16 md:pt-48 md:pb-32 overflow-hidden items-center flex flex-col justify-center px-5 md:px-6">
            {/* Background Decorative Blobs */}
            <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-indigo-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none"></div>
            <div className="absolute top-20 left-[10%] w-[500px] h-[500px] bg-violet-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-sky-300/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-5xl mx-auto text-center relative z-10 w-full"
            >
                {/* Badge */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-slate-200/60 shadow-sm backdrop-blur-md text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8"
                >
                    <Languages size={14} className="text-indigo-500" />
                    <span>Next-Gen Translation AI</span>
                </motion.div>

                {/* Headline */}
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.15] md:leading-[1.1] mb-6 md:mb-8"
                >
                    Break language barriers <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                        with zero friction.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed font-medium px-2"
                >
                    A premium workspace designed for professionals to seamlessly translate, organize, and reference multi-lingual content in real-time.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-row items-center justify-center gap-2 md:gap-5 px-2 sm:px-0"
                >
                    <button 
                        onClick={() => navigate('/login')}
                        className="flex-1 sm:flex-none group relative px-4 sm:px-10 py-3.5 md:py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-[13px] sm:text-base md:text-lg shadow-[0_10px_40px_-10px_rgba(79,70,229,0.7)] hover:shadow-[0_15px_50px_-10px_rgba(79,70,229,0.9)] transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 overflow-hidden border-none cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center gap-1.5 whitespace-nowrap">
                            Join Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
                        </span>
                    </button>
                    
                    <button 
                        onClick={() => {
                            const pricingSection = document.getElementById('pricing');
                            pricingSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex-1 sm:flex-none px-4 sm:px-10 py-3.5 md:py-5 bg-white hover:bg-slate-50 text-slate-800 rounded-full font-bold text-[13px] sm:text-base md:text-lg border border-slate-200 shadow-sm transition-all duration-300 active:scale-95 hover:border-slate-300 cursor-pointer whitespace-nowrap"
                    >
                        Pricing
                    </button>
                </motion.div>
                
                {/* Hero Dashboard Preview — Animated Translation */}
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                    className="mt-20 relative mx-auto w-full max-w-4xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl -z-10 rounded-[3rem]"></div>
                    <div className="rounded-[2.5rem] border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden p-2">
                        <div className="rounded-[2rem] overflow-hidden border border-slate-100 bg-slate-50 relative flex flex-col">
                           {/* Fake Header Bar */}
                           <div className="h-10 md:h-14 border-b border-slate-200 flex items-center px-4 md:px-6 gap-2 bg-white">
                               <div className="flex gap-1.5 md:hidden">
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                                   <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                               </div>
                               <div className="hidden md:flex gap-1.5">
                                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                   <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                               </div>
                               <div className="mx-auto px-4 md:px-6 py-1.5 md:py-2 bg-slate-100/80 rounded-lg text-[9px] md:text-[11px] font-black text-slate-400 tracking-widest uppercase">
                                   AI Workspace
                               </div>
                           </div>

                           {/* Translation Body */}
                           <div className="flex-1 flex flex-col md:flex-row p-5 md:p-8 gap-5 md:gap-8 min-h-[280px] md:min-h-[220px]">
                               {/* Source Panel */}
                               <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-7 relative flex flex-col group min-h-[100px]">
                                   <div className="flex items-center justify-between mb-3 md:mb-5">
                                       <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">{currentPair.sourceLang}</span>
                                       <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                   </div>
                                   <p className="text-slate-800 text-base md:text-lg font-bold leading-relaxed flex-1 min-h-[44px] md:min-h-[48px]">
                                       {sourceDisplayed}
                                       {phase === 'typing-source' && (
                                           <span className="inline-block w-[2.5px] h-5 bg-indigo-500 ml-0.5 animate-pulse align-middle"></span>
                                       )}
                                   </p>
                               </div>

                               {/* Target Panel */}
                               <div className="flex-1 bg-indigo-50/60 rounded-2xl border border-indigo-100 shadow-sm p-5 md:p-7 relative flex flex-col min-h-[100px]">
                                   <div className="flex items-center justify-between mb-3 md:mb-5">
                                       <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400">{currentPair.targetLang}</span>
                                       {(phase === 'typing-target' || phase === 'translating') && (
                                           <div className="flex items-center gap-1.5">
                                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '0ms'}}></div>
                                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '150ms'}}></div>
                                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay: '300ms'}}></div>
                                           </div>
                                       )}
                                       {phase === 'paused' && targetDisplayed.length > 0 && (
                                           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">✓ Refined</span>
                                       )}
                                   </div>
                                   <div className="text-indigo-900 text-base md:text-lg font-bold leading-relaxed flex-1 min-h-[44px] md:min-h-[48px]">
                                       {phase === 'translating' ? (
                                           <div className="space-y-3 md:space-y-4 animate-pulse">
                                               <div className="h-4 bg-indigo-200/50 rounded-full w-3/4"></div>
                                               <div className="h-4 bg-indigo-200/50 rounded-full w-1/2"></div>
                                           </div>
                                       ) : (
                                           <>
                                               {targetDisplayed}
                                               {phase === 'typing-target' && (
                                                   <span className="inline-block w-[2.5px] h-5 bg-indigo-500 ml-0.5 animate-pulse align-middle"></span>
                                               )}
                                               {phase === 'typing-source' && targetDisplayed.length === 0 && (
                                                   <span className="text-indigo-300 text-sm md:text-base italic font-medium">Translating...</span>
                                               )}
                                           </>
                                       )}
                                   </div>
                               </div>
                           </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
