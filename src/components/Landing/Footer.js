import React from 'react';
import { Languages } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 pt-16 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
                    {/* Brand */}
                    <div className="max-w-sm">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <Languages size={20} />
                            </div>
                            <span className="text-xl font-black text-slate-900 tracking-tight">{process.env.REACT_APP_NAME}</span>
                        </div>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            Next-generation translation tools designed for professionals. Break language barriers with zero friction.
                        </p>
                    </div>

                    {/* Quick Links — Only functional ones */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-5 uppercase tracking-widest text-xs">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#features" className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#pricing" className="text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                                    Pricing
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm font-medium text-slate-400">
                        &copy; {new Date().getFullYear()} {process.env.REACT_APP_NAME}. All rights reserved.
                    </p>
                    <div className="text-sm border border-slate-100 rounded-full px-4 py-1.5 text-slate-400 font-medium bg-slate-50">
                        Powered by <span className="text-emerald-500 font-bold inline-flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>  GEMINI</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
