import { toBcp47 } from './languageCodes';

// Chrome ends recognition on its own after a pause even in continuous mode,
// so `no-speech` is normal operation, not a failure worth surfacing.
const IGNORED_ERRORS = ['no-speech', 'aborted'];

const getRecognitionCtor = () => window.SpeechRecognition || window.webkitSpeechRecognition;

export const isWebSpeechSupported = () => Boolean(getRecognitionCtor());

export const createWebSpeechSession = ({ lang, onPartial, onFinal, onError }) => {
  let recognition = null;
  let active = false;

  const start = async () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) throw new Error('Web Speech recognition is not supported in this browser');

    recognition = new Ctor();
    recognition.lang = toBcp47(lang);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          const text = transcript.trim();
          if (text) onFinal({ text });
        } else {
          interim += transcript;
        }
      }
      if (interim) onPartial(interim);
    };

    recognition.onerror = (event) => {
      if (IGNORED_ERRORS.includes(event.error)) return;
      active = false;
      onError(Object.assign(new Error(`Speech recognition failed: ${event.error}`), { code: event.error }));
    };

    recognition.onend = () => {
      if (!active) return;
      try {
        recognition.start();
      } catch (err) {
        active = false;
        onError(err);
      }
    };

    active = true;
    recognition.start();
  };

  const stop = () => {
    active = false;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // Already stopped — nothing to unwind.
    }
  };

  return { start, stop };
};
