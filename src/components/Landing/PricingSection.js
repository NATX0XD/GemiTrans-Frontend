import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Star } from 'lucide-react';

const PricingSection = () => {
    const navigate = useNavigate();

    return (
        <section id="pricing" className="py-24 bg-slate-50 relative z-10 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                        Simple, transparent pricing.
                    </h2>
                    <p className="text-xl text-slate-600 font-medium leading-relaxed">
                        Start for free, upgrade when you need more power. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto">
                    
                    {/* Free Tier */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div className="mb-4 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-1 md:mb-2">Starter</h3>
                            <p className="text-[11px] md:text-base text-slate-500 font-medium leading-tight">Perfect for trying out the platform.</p>
                        </div>
                        <div className="mb-4 md:mb-8 flex items-baseline gap-1 md:gap-2">
                            <span className="text-3xl md:text-6xl font-black text-slate-900">$0</span>
                            <span className="text-[10px] md:text-base text-slate-500 font-medium">/ mo</span>
                        </div>
                        <ul className="space-y-2 md:space-y-4 mb-6 md:mb-10">
                            {[
                                "5,000 tokens / mo",
                                "3 Notes",
                                "10 Words",
                                "History access",
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 md:gap-4 text-[10px] md:text-base text-slate-700 font-medium leading-tight">
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check size={10} className="text-slate-600 md:w-3.5 md:h-3.5" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs md:text-lg transition-colors border-none cursor-pointer"
                        >
                            Get Started
                        </button>
                    </motion.div>

                    {/* Pro Tier */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="bg-slate-900 rounded-3xl md:rounded-[2.5rem] p-5 md:p-10 border border-slate-800 shadow-2xl relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-indigo-500/20 rounded-full blur-[40px] md:blur-[80px] -mr-10 md:-mr-20 -mt-10 md:-mt-20"></div>
                        
                        <div className="absolute top-4 md:top-8 right-4 md:right-8 bg-indigo-500/10 border border-indigo-400/20 px-2 md:px-4 py-1 rounded-full flex items-center gap-1 md:gap-2">
                            <Star size={10} className="text-indigo-400 fill-indigo-400 md:w-3 md:h-3" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-300">Popular</span>
                        </div>
                        
                        <div className="mb-4 md:mb-8 relative z-10">
                            <h3 className="text-xl md:text-2xl font-black text-white mb-1 md:mb-2">Pro</h3>
                            <p className="text-[11px] md:text-base text-slate-400 font-medium leading-tight">For professionals needing power.</p>
                        </div>
                        <div className="mb-4 md:mb-8 flex items-baseline gap-1 md:gap-2 relative z-10">
                            <span className="text-3xl md:text-6xl font-black text-white">$12</span>
                            <span className="text-[10px] md:text-base text-slate-400 font-medium">/ mo</span>
                        </div>
                        <ul className="space-y-2 md:space-y-4 mb-6 md:mb-10 relative z-10">
                            {[
                                "50,000 tokens / mo",
                                "Unlimited Notes",
                                "Unlimited Saved",
                                "Priority support",
                            ].map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 md:gap-4 text-[10px] md:text-base text-slate-200 font-medium leading-tight">
                                    <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <Check size={10} className="text-indigo-400 md:w-3.5 md:h-3.5" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => navigate('/login')}
                            className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs md:text-lg transition-colors border-none shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] relative z-10 cursor-pointer"
                        >
                            Pro Trial
                        </button>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default PricingSection;
