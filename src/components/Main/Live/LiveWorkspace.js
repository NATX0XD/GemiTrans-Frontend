import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '../../../context/LanguageContext';
import { auth } from '../../../configuration/firebase';
import useQuota from '../../../hooks/useQuota';
import { createLiveSession, resolveEngine, ENGINES } from '../../../services/live';
import {
  requestLiveToken,
  reportLiveUsage,
  prefetchIdToken,
  confirmLiveSession,
} from '../../../context/LiveApi';
import { translateTextAPI } from '../../../context/ControllerApi';
import { buildTargets, pickTarget } from '../../../services/live/direction';
import { speakText } from '../../../services/speechService';
import { appendTranslationHistory } from '../../../services/historyService';
import LanguageSelectorModal from '../CardTranslator/LanguageSelectorModal';
import QuotaExceededModal from '../Modal/QuotaExceededModal';
import ModeTabs from './ModeTabs';
import LanguagePairBar from './LanguagePairBar';
import TwoWayToggle from './TwoWayToggle';
import MicButton from './MicButton';
import TranscriptStream from './TranscriptStream';

const DEFAULT_OBJECTIVE = 'general';
const DEFAULT_FORMALITY = 50;

const LiveWorkspace = () => {
  const { t } = useTranslation();
  const { uid, liveSecondsUsed, liveSecondsLimit } = useQuota();

  const [langA, setLangA] = useState('English');
  const [langB, setLangB] = useState('Thai');
  const [twoWay, setTwoWay] = useState(false);
  const [preferGemini, setPreferGemini] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const [listening, setListening] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [utterances, setUtterances] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [notice, setNotice] = useState(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [langPicker, setLangPicker] = useState(null);

  const sessionRef = useRef(null);
  const startedAtRef = useRef(null);
  // True between a successful mint and the /api/live-usage post that releases it.
  const mintedRef = useRef(false);
  const idTokenRef = useRef(null);
  const utterancesRef = useRef([]);
  const autoSpeakRef = useRef(autoSpeak);
  const settingsRef = useRef({ langA: 'English', langB: 'Thai', twoWay: false });

  useEffect(() => { autoSpeakRef.current = autoSpeak; }, [autoSpeak]);
  useEffect(() => { utterancesRef.current = utterances; }, [utterances]);
  useEffect(() => { settingsRef.current = { langA, langB, twoWay }; }, [langA, langB, twoWay]);

  const availableEngine = resolveEngine({ preferGemini, hasToken: true });
  const engineUnavailable = availableEngine === null;
  // Browser recognition needs its language fixed up front, so two-way there
  // splits into one mic per speaker. Gemini detects the language itself.
  const perSpeakerMics = twoWay && availableEngine === ENGINES.WEB_SPEECH;

  const updateUtterance = useCallback((id, patch) => {
    setUtterances((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const translateUtterance = useCallback(async (id, text) => {
    const { langA: a, langB: b, twoWay: isTwoWay } = settingsRef.current;

    try {
      const response = await translateTextAPI({
        uid: auth.currentUser?.uid,
        sourceText: text,
        twoWay: isTwoWay,
        targets: buildTargets({
          twoWay: isTwoWay,
          langA: a,
          langB: b,
          objective: DEFAULT_OBJECTIVE,
          formality: DEFAULT_FORMALITY,
        }),
      });

      const translation = response.translations?.[0];
      const targetLang = translation?.lang
        || (isTwoWay ? pickTarget({ detected: response.detected, langA: a, langB: b }) : b);

      updateUtterance(id, {
        status: 'done',
        translatedText: translation?.text || '',
        targetLang,
        sourceLang: response.detected || a,
      });

      if (autoSpeakRef.current && translation?.text) {
        speakText(translation.text, targetLang);
      }
    } catch (err) {
      if (err.status === 429) setShowQuotaModal(true);
      updateUtterance(id, { status: 'failed' });
    }
  }, [updateUtterance]);

  const handleFinal = useCallback(({ text }) => {
    setInterimText('');
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { langA: a, langB: b } = settingsRef.current;

    setUtterances((current) => [
      ...current,
      { id, sourceText: text, sourceLang: a, translatedText: '', targetLang: b, status: 'pending' },
    ]);

    translateUtterance(id, text);
  }, [translateUtterance]);

  const handleRetry = useCallback((id) => {
    const utterance = utterancesRef.current.find((item) => item.id === id);
    if (!utterance) return;
    updateUtterance(id, { status: 'pending' });
    translateUtterance(id, utterance.sourceText);
  }, [translateUtterance, updateUtterance]);

  /**
   * Hand the minted session back to the server. Must run for every mint, including
   * ones that produced no audio: the POST is what clears `live_session`, and a mint
   * left dangling is billed as an abandoned session for the full TTL next time.
   */
  const releaseMint = useCallback((seconds) => {
    if (!mintedRef.current) return;
    mintedRef.current = false;

    const currentUid = auth.currentUser?.uid || uid;
    if (!currentUid) return;

    reportLiveUsage(currentUid, seconds, { idToken: idTokenRef.current }).catch((err) =>
      console.error('Failed to report live usage', err)
    );
  }, [uid]);

  const stopListening = useCallback(async () => {
    setListening(false);
    setActiveSpeaker(null);
    setInterimText('');

    const session = sessionRef.current;
    sessionRef.current = null;

    const elapsedSeconds = startedAtRef.current ? (Date.now() - startedAtRef.current) / 1000 : 0;
    startedAtRef.current = null;

    // Bill before tearing down. This also runs from pagehide, where the document can
    // disappear at the first await — session.stop() awaits audioContext.close(), so
    // doing it first would leave the keepalive POST unissued.
    releaseMint(elapsedSeconds);

    if (session) {
      // A teardown that throws must not take the history write down with it.
      try {
        await session.stop();
      } catch (err) {
        console.error('Failed to stop the live session', err);
      }
    }

    const saveable = utterancesRef.current
      .filter((item) => item.status === 'done' && item.translatedText)
      .map((item) => ({
        sourceText: item.sourceText,
        sourceLang: item.sourceLang,
        translatedText: item.translatedText,
        targetLang: item.targetLang,
        objective: DEFAULT_OBJECTIVE,
        formality: DEFAULT_FORMALITY,
      }));

    const currentUid = auth.currentUser?.uid || uid;
    if (currentUid && saveable.length > 0) {
      appendTranslationHistory(currentUid, saveable).catch((err) =>
        console.error('Failed to save live history', err)
      );
    }
  }, [uid, releaseMint]);

  // `speaker` is 1 or 2 and only matters for two-way browser mode, where the
  // engine needs a fixed language and cannot detect who is talking.
  const startListening = useCallback(async (speaker = 1) => {
    setNotice(null);

    let token = null;
    if (preferGemini) {
      try {
        const minted = await requestLiveToken(auth.currentUser?.uid || uid);
        token = minted.token;
        mintedRef.current = true;
        // Cached now so the unload path can POST without awaiting a token refresh.
        // Always overwritten, including with null: keeping the previous session's
        // bearer here would send the unload POST out with a stale token and 401.
        idTokenRef.current = await prefetchIdToken();
      } catch (err) {
        setNotice(t('live.errors.fellBackToBrowser'));
      }
    }

    const engine = resolveEngine({ preferGemini, hasToken: Boolean(token) });
    if (!engine) {
      releaseMint(0);
      setNotice(t('live.errors.noEngine'));
      return;
    }

    // A mint we are not going to use — the resolver sent us to the browser engine —
    // still holds live_session open, and those seconds are not Gemini's to bill.
    if (engine !== ENGINES.GEMINI) releaseMint(0);

    const { langA: a, langB: b } = settingsRef.current;

    const session = createLiveSession({
      engine,
      lang: speaker === 2 ? b : a,
      token,
      onPartial: setInterimText,
      onFinal: handleFinal,
      onError: (err) => {
        setNotice(err?.name === 'NotAllowedError' ? t('live.errors.micDenied') : t('live.errors.sessionFailed'));
        stopListening();
      },
    });

    sessionRef.current = session;

    try {
      await session.start();
      startedAtRef.current = Date.now();

      // The socket is open, so this mint is now eligible for abandoned-session
      // billing. Fire-and-forget: the session is already running and a confirmation
      // that fails must not take it down — the worst case is the server declining to
      // bill a session it could not confirm.
      if (mintedRef.current) {
        confirmLiveSession(auth.currentUser?.uid || uid).catch((err) =>
          console.error('Failed to confirm the live session', err)
        );
      }

      setActiveSpeaker(speaker);
      setListening(true);
    } catch (err) {
      sessionRef.current = null;
      // Zero seconds, but the mint must still be handed back — a denied microphone
      // would otherwise cost the user their whole daily allowance on the next try.
      releaseMint(0);
      setNotice(err?.name === 'NotAllowedError' ? t('live.errors.micDenied') : t('live.errors.sessionFailed'));
    }
  }, [preferGemini, uid, t, handleFinal, stopListening, releaseMint]);

  // A closed tab still owes its seconds.
  useEffect(() => {
    const teardown = () => {
      // stopListening is async; an unhandled rejection here would happen mid-unload
      // and skip nothing useful, but it would be invisible. Catch it explicitly.
      if (sessionRef.current || mintedRef.current) {
        Promise.resolve(stopListening()).catch((err) =>
          console.error('Failed to close the live session', err)
        );
      }
    };
    window.addEventListener('pagehide', teardown);
    return () => {
      window.removeEventListener('pagehide', teardown);
      teardown();
    };
  }, [stopListening]);

  useEffect(() => {
    if (engineUnavailable) setNotice(t('live.errors.noEngine'));
  }, [engineUnavailable, t]);

  const openPicker = (slot) => setLangPicker(slot);

  const handlePickLanguage = (slot, lang) => {
    if (slot === 'A') setLangA(lang);
    if (slot === 'B') setLangB(lang);
    setLangPicker(null);
  };

  const swapLanguages = () => {
    setLangA(langB);
    setLangB(langA);
  };

  const secondsLeft = Math.max(0, liveSecondsLimit - liveSecondsUsed);

  return (
    <div className="w-full flex-1 flex flex-col items-center gap-6 px-4 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 text-center">
        {t('live.heading')}
      </h1>

      <ModeTabs mode="translate" onChange={() => {}} />

      <LanguagePairBar
        langA={langA}
        langB={langB}
        onPickA={() => openPicker('A')}
        onPickB={() => openPicker('B')}
        onSwap={swapLanguages}
        disabled={listening}
      />

      <TwoWayToggle
        enabled={twoWay}
        onChange={setTwoWay}
        infoText={preferGemini ? t('live.twoWayInfo') : t('live.twoWayWebSpeechInfo')}
        disabled={listening}
      />

      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('live.highQuality')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={preferGemini}
          aria-label={t('live.highQuality')}
          disabled={listening}
          onClick={() => setPreferGemini((value) => !value)}
          className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
            preferGemini ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${preferGemini ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('live.autoSpeak')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={autoSpeak}
          aria-label={t('live.autoSpeak')}
          onClick={() => setAutoSpeak((value) => !value)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            autoSpeak ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${autoSpeak ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {notice && (
        <p className="w-full rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {notice}
        </p>
      )}

      <TranscriptStream
        utterances={utterances}
        interimText={interimText}
        onRetry={handleRetry}
        emptyLabel={t('live.empty')}
      />

      {perSpeakerMics ? (
        <div className="flex items-end gap-8">
          {[1, 2].map((speaker) => {
            const speakerListening = listening && activeSpeaker === speaker;
            return (
              <MicButton
                key={speaker}
                size="sm"
                state={speakerListening ? 'listening' : 'idle'}
                label={t('live.speaker').replace('{n}', speaker)}
                onClick={() => (speakerListening ? stopListening() : startListening(speaker))}
                disabled={engineUnavailable || (listening && !speakerListening)}
              />
            );
          })}
        </div>
      ) : (
        <MicButton
          state={listening ? 'listening' : 'idle'}
          label={listening ? t('live.listening') : t('live.press')}
          onClick={listening ? stopListening : () => startListening(1)}
          disabled={engineUnavailable}
        />
      )}

      <p className="text-xs text-slate-400">
        {t('live.minutesLeft').replace('{seconds}', secondsLeft)}
      </p>

      <LanguageSelectorModal
        isOpen={langPicker !== null}
        onClose={() => setLangPicker(null)}
        activeCardId={langPicker}
        currentLang={langPicker === 'A' ? langA : langB}
        onSelectLanguage={handlePickLanguage}
      />

      <QuotaExceededModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} />
    </div>
  );
};

export default LiveWorkspace;
