// Lightweight i18n dictionary for the whole app (TH / EN).
// Each zone lives in its own module under ./zones and exports { en, th }.
// They are deep-merged here so components can look up t('zone.key').
// Missing keys fall back to English, then to the raw key (see LanguageContext).

import common from './zones/common';
import nav from './zones/nav';
import translator from './zones/translator';
import notebook from './zones/notebook';
import history from './zones/history';
import saved from './zones/saved';
import settings from './zones/settings';
import auth from './zones/auth';
import landing from './zones/landing';

const ZONES = [common, nav, translator, notebook, history, saved, settings, auth, landing];

const deepMerge = (target, source) => {
    for (const key of Object.keys(source)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
};

const build = (lang) => ZONES.reduce((acc, zone) => deepMerge(acc, zone[lang] || {}), {});

export const translations = {
    en: build('en'),
    th: build('th'),
};
