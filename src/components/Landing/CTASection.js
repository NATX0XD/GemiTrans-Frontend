import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 relative z-10 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700 rounded-[2rem] md:rounded-[3rem] px-6 py-16 md:px-16 md:py-24 text-center overflow-hidden shadow-2xl shadow-indigo-500/20"
                >
                    {/* Decorative Blurs */}
                    <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-violet-400/20 rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none"></div>

                    <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight mb-4 md:mb-6 relative z-10 leading-tight">
                        Ready to break language barriers?
                    </h2>
                    <p className="text-sm md:text-xl text-indigo-100 font-medium max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed relative z-10">
                        Join thousands of professionals using AI Workbench to communicate seamlessly across languages.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full md:w-auto group relative px-8 md:px-10 py-3.5 md:py-4 bg-white hover:bg-slate-50 text-indigo-700 rounded-full font-bold text-base md:text-lg shadow-lg transition-all duration-300 active:scale-95 inline-flex items-center justify-center gap-2 z-10 cursor-pointer border-none"
                    >
                        Get Started Free
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform md:w-5 md:h-5" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
