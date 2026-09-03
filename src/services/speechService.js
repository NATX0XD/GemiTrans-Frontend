
import { auth } from '../configuration/firebase';
import { getUserSettings } from './settingsService';
import { toBcp47 } from './live/languageCodes';

let cachedSettings = null;

export const clearSpeechSettingsCache = () => {
  cachedSettings = null;
};

/**
 * 
 * @param {string} text 
 * @param {string} languageLabel 
 */
export const speakText = async (text, languageLabel) => {
  if (!text || !window.speechSynthesis) return;


  window.speechSynthesis.cancel();


  if (!cachedSettings && auth.currentUser) {
    const settings = await getUserSettings(auth.currentUser.uid);
    if (settings && settings.voiceSettings) {
      cachedSettings = settings.voiceSettings;
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);


  utterance.lang = toBcp47(languageLabel);


  utterance.rate = cachedSettings?.speed ?? 1.0;
  utterance.pitch = cachedSettings?.pitch ?? 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
