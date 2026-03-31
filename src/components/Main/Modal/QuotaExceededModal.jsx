import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, TrendingUp, ShieldCheck, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuotaExceededModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white/20 dark:border-slate-800"
                >
                    {/* Header Image/Icon Section */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse"></div>

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl border border-white/30 mb-4 transform -rotate-6 duration-1000">
                                <Languages size={40} className="text-white fill-white/20" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Quota Limit Reached</h2>
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors cursor-pointer border-0 outline-none group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 sm:p-10">
                        <p className="text-slate-600 dark:text-slate-400 font-bold text-center mb-10 leading-relaxed max-w-sm mx-auto">
                            You've hit your daily limit of <span className="text-indigo-600 dark:text-indigo-400">10,000 tokens</span>.
                            Unlock unlimited translations and premium AI models today.
                        </p>

                        <div className="space-y-4 mb-10">
                            <FeatureItem icon={<TrendingUp size={16} />} text="1,000,000+ Monthly Tokens" />
                            <FeatureItem icon={<Sparkles size={16} />} text="Custom Translation Objectives" />
                            <FeatureItem icon={<ShieldCheck size={16} />} text="Priority API Access" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-black tracking-tight hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer outline-none text-sm"
                            >
                                Not Now
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/pricing');
                                }}
                                className="px-6 py-4 rounded-2xl bg-indigo-600 text-white font-black tracking-tight hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer outline-none border-0 text-sm flex items-center justify-center gap-2 group"
                            >
                                <Sparkles size={18} className="animate-pulse" />
                                Upgrade Plan
                            </button>
                        </div>
                    </div>

                    {/* Decorative bottom glow */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const FeatureItem = ({ icon, text }) => (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50">
        <div className="text-indigo-600 dark:text-indigo-400">
            {icon}
        </div>
        <span className="text-xs font-black text-slate-700 dark:text-slate-200 tracking-tight">{text}</span>
    </div>
);

export default QuotaExceededModal;
