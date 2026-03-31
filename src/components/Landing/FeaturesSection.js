import React from 'react';
import { motion } from 'framer-motion';
import { Zap, BookMarked, History, ShieldCheck } from 'lucide-react';

const FeaturesSection = () => {
    const features = [
        {
            icon: <Zap className="text-amber-500" size={24} />,
            title: "Lightning Fast Translation",
            description: "Powered by advanced AI models, get real-time translations across dozens of languages with native-like accuracy.",
            bg: "bg-amber-50"
        },
        {
            icon: <BookMarked className="text-emerald-500" size={24} />,
            title: "Smart Smartbook",
            description: "Save important words and full translations to your personal notebook. Organize by custom tags and access them instantly.",
            bg: "bg-emerald-50"
        },
        {
            icon: <History className="text-indigo-500" size={24} />,
            title: "Contextual History",
            description: "Never lose a translation. Your entire workflow is automatically saved with contextual metadata for easy retrieval.",
            bg: "bg-indigo-50"
        },
        {
            icon: <ShieldCheck className="text-rose-500" size={24} />,
            title: "Privacy First Workspace",
            description: "Your data is encrypted and secure. We focus on providing a private, secure environment for your intellectual property.",
            bg: "bg-rose-50"
        }
    ];

    return (
        <section id="features" className="py-24 bg-white relative z-10 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                        Everything you need to work <span className="text-indigo-600">globally.</span>
                    </h2>
                    <p className="text-xl text-slate-600 font-medium leading-relaxed">
                        A suite of powerful tools designed specifically to optimize your multilingual workflow.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="bg-slate-50 hover:bg-white rounded-2xl md:rounded-[2rem] p-4 md:p-8 border border-slate-100 hover:border-slate-200 hover:shadow-xl transition-all duration-500 group"
                        >
                            <div className={`w-10 h-10 md:w-14 md:h-14 ${feature.bg} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-slate-100`}>
                                {React.cloneElement(feature.icon, { size: 20, className: feature.icon.props.className + " md:w-6 md:h-6" })}
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{feature.title}</h3>
                            <p className="text-[11px] md:text-base text-slate-600 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
