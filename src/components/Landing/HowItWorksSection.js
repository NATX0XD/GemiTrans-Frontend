import React from 'react';
import { motion } from 'framer-motion';
import { Type, Sparkles, FolderOpen } from 'lucide-react';

const steps = [
    {
        num: '01',
        icon: <Type size={24} />,
        title: 'Type or Paste',
        description: 'Enter any text in any language. Our AI automatically detects the source language for you.',
        color: 'indigo',
    },
    {
        num: '02',
        icon: <Sparkles size={24} />,
        title: 'AI Translates Instantly',
        description: 'Advanced AI models process your text in real-time and deliver accurate, context-aware translations.',
        color: 'violet',
    },
    {
        num: '03',
        icon: <FolderOpen size={24} />,
        title: 'Save & Organize',
        description: 'Bookmark words, save translations to your history, and write notes — your personal language workspace.',
        color: 'emerald',
    },
];

const colorMap = {
    indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        num: 'text-indigo-200',
        border: 'border-indigo-100',
        dot: 'bg-indigo-500',
    },
    violet: {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        num: 'text-violet-200',
        border: 'border-violet-100',
        dot: 'bg-violet-500',
    },
    emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        num: 'text-emerald-200',
        border: 'border-emerald-100',
        dot: 'bg-emerald-500',
    },
};

const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="py-24 bg-slate-50 relative z-10 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-3xl mx-auto mb-12 md:mb-20"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4 md:mb-6">
                        How it <span className="text-indigo-600 font-black">works.</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed px-4 md:px-0">
                        Get started in seconds. No configuration required.
                    </p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[72px] left-[16.6%] right-[16.6%] h-[2px] bg-gradient-to-r from-indigo-200 via-violet-200 to-emerald-200"></div>

                    {steps.map((step, index) => {
                        const c = colorMap[step.color];
                        return (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2, duration: 0.6 }}
                                    className={`relative flex flex-col items-center text-center group ${index === 2 ? 'col-span-2 md:col-span-1' : ''}`}
                                >
                                    {/* Step Circle */}
                                    <div className={`relative w-16 h-16 md:w-[88px] md:h-[88px] ${c.bg} rounded-2xl md:rounded-3xl border ${c.border} flex items-center justify-center mb-4 md:mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm z-10`}>
                                        <span className={c.text}>{React.cloneElement(step.icon, { size: 20, className: "md:w-6 md:h-6" })}</span>
                                        <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 md:w-7 md:h-7 rounded-full ${c.dot} text-white text-[8px] md:text-[10px] font-black flex items-center justify-center shadow-lg`}>
                                            {step.num}
                                        </div>
                                    </div>

                                    <h3 className="text-sm md:text-xl font-bold text-slate-900 mb-1 md:mb-3">{step.title}</h3>
                                    <p className="text-[11px] md:text-base text-slate-600 font-medium leading-relaxed max-w-[140px] md:max-w-xs">
                                        {step.description}
                                    </p>
                                </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
