import { createGeminiLiveSession, isGeminiLiveSupported, LIVE_MODEL } from './geminiLiveEngine';

const mockSession = { sendRealtimeInput: jest.fn(), close: jest.fn() };
const mockConnect = jest.fn();

// A plain function, not jest.fn(): CRA's jest config sets `resetMocks: true`, which
// strips any implementation given here before each test runs.
jest.mock('@google/genai', () => ({
  GoogleGenAI: function GoogleGenAI() {
    return { live: { connect: (...args) => mockConnect(...args) } };
  },
  Modality: { TEXT: 'TEXT' },
}));

let capturedCallbacks;
let mockTrack;

beforeEach(() => {
  mockConnect.mockImplementation(async ({ callbacks }) => {
    capturedCallbacks = callbacks;
    return mockSession;
  });

  mockTrack = { stop: jest.fn() };
  navigator.mediaDevices = {
    getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [mockTrack] }),
  };

  window.AudioContext = jest.fn().mockImplementation(() => ({
    sampleRate: 48000,
    createMediaStreamSource: () => ({ connect: jest.fn(), disconnect: jest.fn() }),
    createScriptProcessor: () => ({ connect: jest.fn(), disconnect: jest.fn() }),
    destination: {},
    close: jest.fn().mockResolvedValue(undefined),
  }));
});

afterEach(() => {
  jest.clearAllMocks();
  delete window.AudioContext;
});

test('exposes the transcription-only model id', () => {
  expect(LIVE_MODEL).toBe('gemini-3.5-transcribe-live');
});

test('support check requires getUserMedia and AudioContext', () => {
  expect(isGeminiLiveSupported()).toBe(true);
  delete window.AudioContext;
  expect(isGeminiLiveSupported()).toBe(false);
});

test('connects with transcription-only config and auto language detection', async () => {
  const session = createGeminiLiveSession({ token: 'auth_tokens/x', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  const config = mockConnect.mock.calls[0][0];
  expect(config.model).toBe('gemini-3.5-transcribe-live');
  expect(config.config.responseModalities).toEqual(['TEXT']);
  expect(config.config.inputAudioTranscription.languageCodes).toEqual([]);
});

test('requests mono mic audio', async () => {
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
    expect.objectContaining({ audio: expect.objectContaining({ channelCount: 1 }) })
  );
});

test('interim transcription reaches onPartial', async () => {
  const onPartial = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial, onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  capturedCallbacks.onmessage({ serverContent: { interimInputTranscription: { text: 'สวัส' } } });
  expect(onPartial).toHaveBeenCalledWith('สวัส');
});

test('final transcription reaches onFinal', async () => {
  const onFinal = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal, onError: jest.fn() });
  await session.start();

  capturedCallbacks.onmessage({ serverContent: { inputTranscription: { text: 'สวัสดีครับ' } } });
  expect(onFinal).toHaveBeenCalledWith({ text: 'สวัสดีครับ' });
});

test('empty transcription text is ignored', async () => {
  const onFinal = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal, onError: jest.fn() });
  await session.start();

  capturedCallbacks.onmessage({ serverContent: { inputTranscription: { text: '  ' } } });
  expect(onFinal).not.toHaveBeenCalled();
});

test('socket errors reach onError', async () => {
  const onError = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  capturedCallbacks.onerror(new Error('socket died'));
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'socket died' }));
});

test('an unexpected close reaches onError, a requested one does not', async () => {
  const onError = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  capturedCallbacks.onclose({ reason: 'server hung up' });
  expect(onError).toHaveBeenCalledTimes(1);

  onError.mockClear();
  await session.stop();
  capturedCallbacks.onclose({ reason: 'client closed' });
  expect(onError).not.toHaveBeenCalled();
});

test('stop releases the mic and closes the session', async () => {
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();
  await session.stop();

  expect(mockTrack.stop).toHaveBeenCalled();
  expect(mockSession.close).toHaveBeenCalled();
});

test('a denied mic permission rejects start', async () => {
  navigator.mediaDevices.getUserMedia.mockRejectedValue(
    Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
  );
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });

  await expect(session.start()).rejects.toMatchObject({ name: 'NotAllowedError' });
});
