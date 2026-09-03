export const TRANSLATE_URL =
  process.env.REACT_APP_TRANSLATION_API_URL || 'https://translator-api-iota.vercel.app/api/translate';

// Every endpoint lives beside /translate on the same deployment.
export const API_ROOT = TRANSLATE_URL.replace(/\/translate\/?$/, '');
