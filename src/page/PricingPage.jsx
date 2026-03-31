import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowLeft, Zap, Star, Crown, ShieldCheck, Sparkles } from 'lucide-react';

const PricingPage = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: 'Free',
            price: '0',
            description: 'Perfect for individual explorers.',
            features: [
                '1,000 Tokens / month',
                'Last 10 history items',
                'Standard AI models',
                'Basic Notebook (5 notes)',
                'Personal usage only'
            ],
            cta: 'Current Plan',
            current: true,
            color: 'slate'
        },
        {
            name: 'Pro',
            price: '19',
            description: 'Best for power users and professionals.',
            features: [
                'Unlimited Tokens',
                'Full Translation History',
                'Priority AI Models (GPT-4o/Claude)',
                'Unlimited Notebook & Tags',
                'Tone & Style Control',
                'Save up to 1,000 words'
            ],
            cta: 'Upgrade to Pro',
            popular: true,
            color: 'indigo'
        },
        {
            name: 'Business',
            price: '49',
            description: 'Advanced features for teams.',
            features: [
                'Everything in Pro',
                'Multi-user Collaboration',
                'API Access (Beta)',
                'Custom Terminology Base',
                'Dedicated Support',
                'Privacy-First Data Isolation'
            ],
            cta: 'Contact Sales',
            color: 'violet'
        }
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden pt-20 pb-20 transition-colors duration-500">
            
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none"></div>
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute top-1/2 -right-24 w-96 h-96 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-16">
                    <button 
                        onClick={() => navigate(-1)}
                        className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:shadow-md transition-all active:scale-95 group cursor-pointer"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Workspace
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Sparkles size={12} />
                        <span>Simple Transparent Pricing</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
                        Choose the plan that <br />
                        <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-400 bg-clip-text text-transparent">fits your workflow.</span>
                    </h1>
                    
                    <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">
                        Unlock the full power of context-aware AI translation and professional organization tools.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div 
                            key={idx}
                            className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] ${
                                plan.popular 
                                ? 'bg-white dark:bg-slate-900 border-indigo-500 shadow-[0_20px_50px_-12px_rgba(79,70,229,0.2)] z-20' 
                                : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                                    plan.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600' :
                                    plan.color === 'violet' ? 'bg-violet-50 dark:bg-violet-900/40 text-violet-600' :
                                    'bg-slate-50 dark:bg-slate-800 text-slate-600'
                                }`}>
                                    {plan.name === 'Free' && <Zap size={24} />}
                                    {plan.name === 'Pro' && <Star size={24} />}
                                    {plan.name === 'Business' && <Crown size={24} />}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                                    <span className="text-slate-500 font-bold text-sm">/month</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                            plan.popular ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-4 rounded-2xl font-black text-sm transition-all duration-300 active:scale-95 border-0 cursor-pointer ${
                                plan.current 
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' 
                                : plan.popular 
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700' 
                                    : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 transition-colors'
                            }`}>
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Trust Indicators */}
                <div className="mt-24 pt-16 border-t border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mb-12">Trusted by Professionals Globally</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                        <div className="flex items-center justify-center gap-2">
                            <ShieldCheck size={20} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-400">SSL Encrypted</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                             <Zap size={20} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-400">Local Privacy</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                             <Crown size={20} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-400">Award Winning</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                             <Star size={20} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-400">4.9/5 Rating</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
