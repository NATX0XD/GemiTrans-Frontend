
import { auth } from '../configuration/firebase';
import { getUserSettings } from './settingsService';

let cachedSettings = null;

export const clearSpeechSettingsCache = () => {
  cachedSettings = null;
};

const languageMap = {
  'English': 'en-US',
  'Japanese': 'ja-JP',
  'Korean': 'ko-KR',
  'Chinese (Simplified)': 'zh-CN',
  'Chinese (Traditional)': 'zh-TW',
  'Thai': 'th-TH',
  'Vietnamese': 'vi-VN',
  'Indonesian': 'id-ID',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'German': 'de-DE',
  'Russian': 'ru-RU',
  'Portuguese': 'pt-PT',
  'Italian': 'it-IT',
  'Arabic': 'ar-SA',
  'Hindi': 'hi-IN',
  'Thai Gen Z slang': 'th-TH',
  'Ancient Royal Thai (Ayutthaya era)': 'th-TH',
  'Thai mystical and astrologer style': 'th-TH',
  'Isan (Northeastern Thai dialect)': 'th-TH',
  'Northern Thai dialect': 'th-TH',
  'Southern Thai dialect': 'th-TH'
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


  const languageCode = languageMap[languageLabel] || 'en-US';
  utterance.lang = languageCode;


  utterance.rate = cachedSettings?.speed ?? 1.0;
  utterance.pitch = cachedSettings?.pitch ?? 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};
window.speechSynthesis.getVoices().forEach(voice => {
  console.log(voice.name, voice.lang);
});

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
