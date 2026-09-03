import { createWebSpeechSession, isWebSpeechSupported } from './webSpeechEngine';
import { createGeminiLiveSession, isGeminiLiveSupported } from './geminiLiveEngine';

export const ENGINES = { GEMINI: 'gemini', WEB_SPEECH: 'webSpeech' };

/**
 * Decide which engine can actually run right now. Returns null when the browser
 * supports neither, which the UI turns into the "unsupported browser" banner.
 */
export const resolveEngine = ({ preferGemini, hasToken }) => {
  if (preferGemini && hasToken && isGeminiLiveSupported()) return ENGINES.GEMINI;
  if (isWebSpeechSupported()) return ENGINES.WEB_SPEECH;
  return null;
};

export const createLiveSession = ({ engine, lang, token, onPartial, onFinal, onError }) => {
  if (engine === ENGINES.GEMINI) {
    return createGeminiLiveSession({ token, onPartial, onFinal, onError });
  }
  if (engine === ENGINES.WEB_SPEECH) {
    return createWebSpeechSession({ lang, onPartial, onFinal, onError });
  }
  throw new Error(`Unknown engine: ${engine}`);
};
