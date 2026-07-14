import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

const SUPPORTED = ['en', 'th'];
const DEFAULT_LANG = 'en';

const resolveInitialLang = () => {
    // Always start in English by default. Only honor an explicit user choice
    // saved from the in-app toggle; no browser-language auto-detection.
    const saved = localStorage.getItem('app-lang');
    if (saved && SUPPORTED.includes(saved)) return saved;
    return DEFAULT_LANG;
};

// Dot-path lookup with {var} interpolation and graceful fallback (lang -> en -> key)
const lookup = (lang, key) => {
    const walk = (dict) => key.split('.').reduce((acc, k) => (acc && acc[k] != null ? acc[k] : undefined), dict);
    const value = walk(translations[lang]);
    if (value != null) return value;
    const fallback = walk(translations.en);
    return fallback != null ? fallback : key;
};

const interpolate = (str, vars) => {
    if (typeof str !== 'string' || !vars) return str;
    return str.replace(/\{(\w+)\}/g, (m, name) => (vars[name] != null ? vars[name] : m));
};

export const LanguageProvider = ({ children }) => {
    const [lang, setLangState] = useState(resolveInitialLang);

    useEffect(() => {
        localStorage.setItem('app-lang', lang);
        document.documentElement.setAttribute('lang', lang);
    }, [lang]);

    const setLang = useCallback((next) => {
        if (SUPPORTED.includes(next)) setLangState(next);
    }, []);

    const toggleLang = useCallback(() => {
        setLangState((prev) => (prev === 'en' ? 'th' : 'en'));
    }, []);

    const t = useCallback((key, vars) => interpolate(lookup(lang, key), vars), [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, supported: SUPPORTED }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
    return ctx;
};

// Convenience hook: const { t } = useTranslation();
export const useTranslation = () => useLanguage();
