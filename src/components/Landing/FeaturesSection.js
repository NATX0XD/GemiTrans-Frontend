import React from 'react';
import { motion } from 'framer-motion';
import { Zap, BookMarked, History, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

const FeaturesSection = () => {
    const { t } = useTranslation();
    const features = [
        {
            icon: <Zap className="text-amber-500" size={24} />,
            title: t('landing.features.feature1Title'),
            description: t('landing.features.feature1Desc'),
            bg: "bg-amber-50"
        },
        {
            icon: <BookMarked className="text-emerald-500" size={24} />,
            title: t('landing.features.feature2Title'),
            description: t('landing.features.feature2Desc'),
            bg: "bg-emerald-50"
        },
        {
            icon: <History className="text-indigo-500" size={24} />,
            title: t('landing.features.feature3Title'),
            description: t('landing.features.feature3Desc'),
            bg: "bg-indigo-50"
        },
        {
            icon: <ShieldCheck className="text-rose-500" size={24} />,
            title: t('landing.features.feature4Title'),
            description: t('landing.features.feature4Desc'),
            bg: "bg-rose-50"
        }
    ];

    return (
        <section id="features" className="py-24 bg-white relative z-10 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-6">
                
                <div className="text-center max-w-3xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700 w-full">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
                        {t('landing.features.headingBefore')} <span className="text-indigo-600">{t('landing.features.headingHighlight')}</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed">
                        {t('landing.features.subheading')}
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
