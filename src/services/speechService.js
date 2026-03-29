/**
 * Text-to-Speech Service
 * Handles reading out text using the browser's Web Speech API.
 */
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
 * Speaks the provided text in the specified language.
 * @param {string} text - The text to speak
 * @param {string} languageLabel - The language label (e.g., 'English', 'Thai')
 */
export const speakText = async (text, languageLabel) => {
  if (!text || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Load settings if not cached
  if (!cachedSettings && auth.currentUser) {
    const settings = await getUserSettings(auth.currentUser.uid);
    if (settings && settings.voiceSettings) {
      cachedSettings = settings.voiceSettings;
    }
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Get language code from map, default to 'en-US' if not found
  const languageCode = languageMap[languageLabel] || 'en-US';
  utterance.lang = languageCode;
  
  // Apply settings from cache or defaults
  utterance.rate = cachedSettings?.speed ?? 1.0;
  utterance.pitch = cachedSettings?.pitch ?? 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};
window.speechSynthesis.getVoices().forEach(voice => {
  console.log(voice.name, voice.lang);
});
/**
 * Stops any ongoing speech.
 */
export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
