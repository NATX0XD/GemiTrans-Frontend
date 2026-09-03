import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../../../context/LanguageContext';
import LiveWorkspace from './LiveWorkspace';
import { createLiveSession, resolveEngine, ENGINES } from '../../../services/live';
import { requestLiveToken, reportLiveUsage, prefetchIdToken } from '../../../context/LiveApi';
import { translateTextAPI } from '../../../context/ControllerApi';
import { speakText } from '../../../services/speechService';
import { appendTranslationHistory } from '../../../services/historyService';

// react-router v7 does not resolve under CRA's jest 27 (package exports), and the
// only router dependency here is QuotaExceededModal's useNavigate.
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }), { virtual: true });
// Automocking services/live still loads the real module to read its shape, and
// geminiLiveEngine pulls in @google/genai, which ships ESM that jest cannot parse.
jest.mock('@google/genai', () => ({ GoogleGenAI: function GoogleGenAI() { return {}; }, Modality: { TEXT: 'TEXT' } }));
jest.mock('../../../services/live');
jest.mock('../../../context/LiveApi');
jest.mock('../../../context/ControllerApi');
jest.mock('../../../services/speechService', () => ({ speakText: jest.fn(), stopSpeech: jest.fn() }));
jest.mock('../../../services/historyService', () => ({ appendTranslationHistory: jest.fn() }));
jest.mock('../../../services/settingsService', () => ({ getUserSettings: jest.fn().mockResolvedValue(null) }));
jest.mock('../../../configuration/firebase', () => ({ auth: { currentUser: { uid: 'user-1' } }, db: {} }));
jest.mock('../../../hooks/useQuota', () => () => ({
  uid: 'user-1', liveSecondsUsed: 0, liveSecondsLimit: 600, isLiveOverLimit: false, isOverLimit: false,
}));

let engineHandlers;

const startedSession = { start: jest.fn().mockResolvedValue(undefined), stop: jest.fn().mockResolvedValue(undefined) };

beforeEach(() => {
  resolveEngine.mockReturnValue(ENGINES.GEMINI);
  requestLiveToken.mockResolvedValue({ token: 'tok', remainingSeconds: 600 });
  reportLiveUsage.mockResolvedValue({ billedSeconds: 3 });
  prefetchIdToken.mockResolvedValue('cached-token');
  startedSession.start.mockResolvedValue(undefined);
  startedSession.stop.mockResolvedValue(undefined);
  translateTextAPI.mockResolvedValue({ detected: 'Thai', translations: [{ lang: 'English', text: 'Hello' }] });
  appendTranslationHistory.mockResolvedValue([]);
  createLiveSession.mockImplementation((options) => {
    engineHandlers = options;
    return startedSession;
  });
});

afterEach(() => jest.clearAllMocks());

const renderWorkspace = () =>
  render(
    <LanguageProvider>
      <LiveWorkspace />
    </LanguageProvider>
  );

const startListening = async () => {
  fireEvent.click(screen.getByRole('button', { name: /press and start talking|กดแล้วเริ่มพูด/i }));
  await waitFor(() => expect(createLiveSession).toHaveBeenCalled());
};

test('starting a session mints a token and starts the engine', async () => {
  renderWorkspace();
  await startListening();

  expect(requestLiveToken).toHaveBeenCalledWith('user-1');
  expect(startedSession.start).toHaveBeenCalled();
});

test('a finished utterance is translated and rendered', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });

  expect(await screen.findByText('Hello')).toBeInTheDocument();
  expect(screen.getByText('สวัสดีครับ')).toBeInTheDocument();
});

test('the translation is spoken when auto-speak is on', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });

  await waitFor(() => expect(speakText).toHaveBeenCalledWith('Hello', 'English'));
});

test('turning auto-speak off stops the speaking', async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole('switch', { name: /read translation aloud|อ่านคำแปลออกเสียง/i }));
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });

  expect(await screen.findByText('Hello')).toBeInTheDocument();
  expect(speakText).not.toHaveBeenCalled();
});

test('a failed translation shows a retry that re-runs the call', async () => {
  translateTextAPI.mockRejectedValueOnce(new Error('network down'));
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });
  const retry = await screen.findByRole('button', { name: /retry|ลองใหม่/i });

  fireEvent.click(retry);
  expect(await screen.findByText('Hello')).toBeInTheDocument();
});

test('stopping reports usage and saves the session to history once', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });
  expect(await screen.findByText('Hello')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() =>
    expect(reportLiveUsage).toHaveBeenCalledWith('user-1', expect.any(Number), expect.any(Object))
  );
  expect(appendTranslationHistory).toHaveBeenCalledTimes(1);
  expect(appendTranslationHistory).toHaveBeenCalledWith('user-1', [
    expect.objectContaining({ sourceText: 'สวัสดีครับ', translatedText: 'Hello', targetLang: 'English' }),
  ]);
});

test('an untranslated utterance is left out of history', async () => {
  translateTextAPI.mockRejectedValue(new Error('network down'));
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });
  await screen.findByRole('button', { name: /retry|ลองใหม่/i });

  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() => expect(reportLiveUsage).toHaveBeenCalled());
  expect(appendTranslationHistory).not.toHaveBeenCalled();
});

test('a token failure falls back to the browser engine with a notice', async () => {
  requestLiveToken.mockRejectedValue(Object.assign(new Error('no billing'), { status: 502 }));
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();
  await startListening();

  expect(createLiveSession).toHaveBeenCalledWith(expect.objectContaining({ engine: ENGINES.WEB_SPEECH }));
  expect(await screen.findByText(/switched to browser speech recognition|สลับไปใช้การรู้จำเสียง/i)).toBeInTheDocument();
});

test('an exhausted live quota still lets the browser engine run', async () => {
  requestLiveToken.mockRejectedValue(Object.assign(new Error('no seconds left'), { status: 429 }));
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();
  await startListening();

  expect(createLiveSession).toHaveBeenCalledWith(expect.objectContaining({ engine: ENGINES.WEB_SPEECH }));
});

test('a denied microphone shows the permission banner', async () => {
  startedSession.start.mockRejectedValueOnce(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
  renderWorkspace();
  await startListening();

  expect(await screen.findByText(/microphone access was denied|ไม่ได้รับสิทธิ์ใช้ไมโครโฟน/i)).toBeInTheDocument();
});

test('a session that never starts releases the minted token', async () => {
  // The mint already wrote live_session server-side. Without a 0-second report it
  // survives, and the next mint bills it as an abandoned session for the full TTL —
  // a whole day of quota burned by a denied microphone prompt.
  startedSession.start.mockRejectedValueOnce(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
  renderWorkspace();
  await startListening();

  await waitFor(() => expect(reportLiveUsage).toHaveBeenCalledWith('user-1', 0, expect.any(Object)));
});

test('falling back to the browser engine releases the minted token', async () => {
  // Mint succeeded but the resolver picked Web Speech: Gemini never ran, so those
  // seconds must not be billed against the live bucket.
  resolveEngine.mockReturnValueOnce(ENGINES.GEMINI).mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();
  await startListening();

  await waitFor(() => expect(reportLiveUsage).toHaveBeenCalledWith('user-1', 0, expect.any(Object)));
  expect(createLiveSession).toHaveBeenCalledWith(expect.objectContaining({ engine: ENGINES.WEB_SPEECH }));
});

test('a browser-only session is never billed for live seconds', async () => {
  requestLiveToken.mockRejectedValue(Object.assign(new Error('no billing'), { status: 502 }));
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();
  await startListening();

  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() => expect(startedSession.stop).toHaveBeenCalled());
  expect(reportLiveUsage).not.toHaveBeenCalled();
});

test('usage is reported before the engine is torn down', async () => {
  // stopListening also runs from pagehide. Awaiting session.stop() first means the
  // document can be gone before the keepalive POST is ever issued.
  const order = [];
  startedSession.stop.mockImplementation(() => {
    order.push('stop');
    return Promise.resolve();
  });
  reportLiveUsage.mockImplementation(() => {
    order.push('report');
    return Promise.resolve({ billedSeconds: 3 });
  });

  renderWorkspace();
  await startListening();
  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() => expect(order).toEqual(['report', 'stop']));
});

test('a failing engine teardown still bills the session', async () => {
  startedSession.stop.mockRejectedValueOnce(new Error('audioContext already closed'));
  renderWorkspace();
  await startListening();

  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() => expect(reportLiveUsage).toHaveBeenCalled());
});

test('the bearer token is prefetched at start for the unload path', async () => {
  prefetchIdToken.mockResolvedValue('cached-token');
  renderWorkspace();
  await startListening();

  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() =>
    expect(reportLiveUsage).toHaveBeenCalledWith('user-1', expect.any(Number), { idToken: 'cached-token' })
  );
});

test('no available engine disables the mic', async () => {
  resolveEngine.mockReturnValue(null);
  renderWorkspace();

  expect(await screen.findByText(/not supported in this browser|ไม่รองรับการพูดแบบเรียลไทม์/i)).toBeInTheDocument();
});

test('interim text renders while speaking', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onPartial('สวัส');
  await waitFor(() => expect(screen.getByTestId('interim-text')).toHaveTextContent('สวัส'));
});

test('two-way in browser mode offers one mic per speaker', async () => {
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();

  fireEvent.click(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }));
  fireEvent.click(screen.getByRole('switch', { name: /high quality|โหมดคุณภาพสูง/i }));

  expect(screen.getByRole('button', { name: /speaker 1|คนที่ 1/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /speaker 2|คนที่ 2/i })).toBeInTheDocument();
});

test('each speaker button locks recognition to its own language', async () => {
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();

  fireEvent.click(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }));
  fireEvent.click(screen.getByRole('switch', { name: /high quality|โหมดคุณภาพสูง/i }));

  fireEvent.click(screen.getByRole('button', { name: /speaker 2|คนที่ 2/i }));
  await waitFor(() => expect(createLiveSession).toHaveBeenCalledWith(expect.objectContaining({ lang: 'Thai' })));
});

test('two-way with Gemini keeps a single shared mic', async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }));

  expect(screen.queryByRole('button', { name: /speaker 1|คนที่ 1/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /press and start talking|กดแล้วเริ่มพูด/i })).toBeInTheDocument();
});
