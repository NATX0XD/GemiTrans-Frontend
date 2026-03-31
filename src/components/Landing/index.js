import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages, Menu, X } from 'lucide-react';
import HeroSection from './HeroSection';
import DemoSection from './DemoSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import StatsSection from './StatsSection';
import PricingSection from './PricingSection';
import CTASection from './CTASection';
import Footer from './Footer';

const Landing = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const scrollToSection = (id) => {
        setIsMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Navbar height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const navLinks = [
        { name: 'Demo', id: 'demo' },
        { name: 'Features', id: 'features' },
        { name: 'How it Works', id: 'how-it-works' },
        { name: 'Efficiency', id: 'stats' },
        { name: 'Pricing', id: 'pricing' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">

            {/* Premium Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3 cursor-pointer group shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                            <Languages size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">{process.env.REACT_APP_NAME}</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8 translate-x-4">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors relative group py-2"
                            >
                                {link.name}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                            </button>
                        ))}
                    </div>

                    {/* Nav Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden lg:block text-slate-600 hover:text-slate-900 font-bold text-sm px-4 py-2 transition-colors mr-2 border-0 bg-transparent cursor-pointer"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-bold text-sm shadow-sm transition-all duration-300 active:scale-95 border-0 cursor-pointer"
                        >
                            Join for Free
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900 md:hidden transition-colors border-0 bg-transparent cursor-pointer z-[100]"
                        >
                            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 bg-white z-[100] md:hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
                        }`}
                >
                    {/* Mobile Menu Header (Logo + Close) */}
                    <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                                <Languages size={20} />
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900">{process.env.REACT_APP_NAME}</span>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-2 text-slate-600 hover:text-slate-900 transition-colors border-0 bg-transparent cursor-pointer"
                        >
                            <X size={28} />
                        </button>
                    </div>

                    <div className="flex bg-white/90  flex-col p-8 gap-8 overflow-y-auto h-[calc(100vh-80px)]">
                        {navLinks.map((link, idx) => (
                            <button
                                key={link.id}
                                onClick={() => scrollToSection(link.id)}
                                className={`text-left text-3xl font-black text-slate-900 border-0 bg-transparent cursor-pointer transition-all duration-500 delay-[${idx * 75}ms] ${isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                                    }`}
                            >
                                {link.name}
                            </button>
                        ))}
                        <div className="mt-auto pb-10 space-y-6">
                            <div className="h-px bg-slate-100"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-base border-2 border-purple-300 cursor-pointer"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="py-4 bg-slate-900 text-white rounded-2xl font-bold text-base border-0 cursor-pointer"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Assembly */}
            <main>
                <HeroSection />
                <DemoSection />
                <FeaturesSection />
                <HowItWorksSection />
                <StatsSection />
                <PricingSection />
                <CTASection />
            </main>

            {/* Footer */}
            <Footer />

        </div>
    );
};

export default Landing;
