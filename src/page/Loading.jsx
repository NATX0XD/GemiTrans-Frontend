import React from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Loader2, Sparkles } from 'lucide-react';
const Loading = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-700 overflow-hidden relative">
            {/* Animated Background Gradients */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-teal-500/5 dark:bg-teal-500/5 rounded-full blur-[100px]"></div>
            </motion.div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Orchestrated Logo & Rings */}
                <div className="relative mb-10">
                    {/* Outer Rotating Ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-[-20px] rounded-[2.5rem] border-2 border-dashed border-indigo-200/50 dark:border-indigo-800/30"
                    ></motion.div>

                    {/* Inner Pulsing Ring */}
                    <motion.div
                        animate={{
                            rotate: -360,
                            scale: [1, 1.05, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{
                            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                            default: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="absolute inset-[-10px] rounded-[2rem] border border-teal-400/40 dark:border-teal-500/20"
                    ></motion.div>

                    {/* Main Logo Card */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 flex items-center justify-center relative z-20 backdrop-blur-xl"
                    >
                        <Languages className="text-indigo-600 dark:text-indigo-400" size={44} />
                        <motion.div
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1"
                        >
                            <Sparkles className="text-amber-400" size={20} fill="currentColor" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Text Content */}
                <div className="text-center space-y-3">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter"
                    >
                        {process.env.REACT_APP_NAME}
                    </motion.h1>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="flex items-center justify-center gap-3"
                    >
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2
                                    }}
                                    className="w-1.5 h-1.5 rounded-full bg-indigo-500"
                                />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
                            Synchronizing Workspace
                        </span>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default Loading