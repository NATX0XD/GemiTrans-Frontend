// Display-name (as used in availableLanguages) -> BCP-47 code.
// Shared by TTS output and Web Speech recognition input.
export const LANGUAGE_CODES = {
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
  'Southern Thai dialect': 'th-TH',
};

export const toBcp47 = (label) => LANGUAGE_CODES[label] || 'en-US';
