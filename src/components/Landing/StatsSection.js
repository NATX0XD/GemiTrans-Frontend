import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Zap, Shield, Clock } from 'lucide-react';

const stats = [
    {
        icon: <Globe size={28} />,
        value: '50+',
        label: 'Languages Supported',
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
    },
    {
        icon: <Zap size={28} />,
        value: 'Real-time',
        label: 'Instant Translation',
        color: 'text-amber-500',
        bg: 'bg-amber-50',
    },
    {
        icon: <Clock size={28} />,
        value: '99.9%',
        label: 'Uptime Guarantee',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50',
    },
    {
        icon: <Shield size={28} />,
        value: 'Encrypted',
        label: 'Data Security',
        color: 'text-rose-500',
        bg: 'bg-rose-50',
    },
];

const StatsSection = () => {
    return (
        <section id="stats" className="py-20 bg-white relative z-10 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className={`w-12 h-12 md:w-16 md:h-16 ${stat.bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100`}>
                                <span className={stat.color}>{React.cloneElement(stat.icon, { size: 22, className: "md:w-7 md:h-7" })}</span>
                            </div>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-0.5 md:mb-1">{stat.value}</span>
                            <span className="text-[10px] md:text-xs lg:text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default StatsSection;
