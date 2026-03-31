import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Globe, Ghost } from 'lucide-react';
import { Button } from '@heroui/react';

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-700">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-2xl text-center space-y-12">
                {/* Visual 404 Block */}
                <div className="relative inline-block">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-20"
                    >
                        <h1 className="text-[180px] md:text-[240px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-800 opacity-10 py-4 select-none">
                            404
                        </h1>
                    </motion.div>

                    {/* Floating Illustration */}
                    <motion.div 
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 5, 0, -5, 0]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-white dark:bg-slate-900 shadow-2xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center backdrop-blur-xl">
                            <Ghost className="text-indigo-600 dark:text-indigo-400 w-16 h-16 md:w-20 md:h-20" strokeWidth={1.5} />
                        </div>
                    </motion.div>

                    {/* Floating Symbols */}
                    <motion.div 
                        animate={{ y: [-10, 10, -10], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="absolute -top-4 left-0 text-teal-500"
                    >
                        <Globe size={32} />
                    </motion.div>
                    <motion.div 
                        animate={{ y: [10, -10, 10], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                        className="absolute bottom-0 right-0 text-indigo-500"
                    >
                        <Search size={32} />
                    </motion.div>
                </div>

                {/* Content Block */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="space-y-6"
                >
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                            Lost in Translation?
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-md mx-auto leading-relaxed">
                            The page you are looking for doesn't exist or has been moved to another dimension.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button
                            size="lg"
                            variant="shadow"
                            onPress={() => navigate('/')}
                            className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center gap-2 group border-none cursor-pointer"
                        >
                            <Home size={20} />
                            Back to Home
                        </Button>
                        <Button
                            size="lg"
                            variant="flat"
                            onPress={() => navigate(-1)}
                            className="h-14 px-8 bg-slate-200/50 dark:bg-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold rounded-2xl active:scale-[0.98] transition-all flex items-center gap-2 border-none cursor-pointer"
                        >
                            <ArrowLeft size={20} />
                            Go Back
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Breadcrumb style decoration */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 text-[10px] uppercase font-black tracking-[0.3em] text-slate-300 dark:text-slate-700 select-none"
            >
                Error Code: 0x404_PAGE_NOT_FOUND
            </motion.div>
        </div>
    );
};

export default PageNotFound;