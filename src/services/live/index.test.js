import { ENGINES, resolveEngine, createLiveSession } from './index';
import { createWebSpeechSession, isWebSpeechSupported } from './webSpeechEngine';
import { createGeminiLiveSession, isGeminiLiveSupported } from './geminiLiveEngine';

jest.mock('./webSpeechEngine', () => ({
  isWebSpeechSupported: jest.fn(),
  createWebSpeechSession: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
}));

jest.mock('./geminiLiveEngine', () => ({
  isGeminiLiveSupported: jest.fn(),
  createGeminiLiveSession: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
}));

afterEach(() => jest.clearAllMocks());

test('prefers Gemini when it is supported and a token is in hand', () => {
  isGeminiLiveSupported.mockReturnValue(true);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: true, hasToken: true })).toBe(ENGINES.GEMINI);
});

test('falls back to Web Speech without a token', () => {
  isGeminiLiveSupported.mockReturnValue(true);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: true, hasToken: false })).toBe(ENGINES.WEB_SPEECH);
});

test('honours the user turning high quality mode off', () => {
  isGeminiLiveSupported.mockReturnValue(true);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: false, hasToken: true })).toBe(ENGINES.WEB_SPEECH);
});

test('falls back when the browser cannot capture audio', () => {
  isGeminiLiveSupported.mockReturnValue(false);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: true, hasToken: true })).toBe(ENGINES.WEB_SPEECH);
});

test('returns null when no engine is available at all', () => {
  isGeminiLiveSupported.mockReturnValue(false);
  isWebSpeechSupported.mockReturnValue(false);
  expect(resolveEngine({ preferGemini: true, hasToken: true })).toBeNull();
});

test('createLiveSession routes to the Gemini engine with the token', () => {
  const handlers = { onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() };
  createLiveSession({ engine: ENGINES.GEMINI, lang: 'Thai', token: 'tok', ...handlers });

  expect(createGeminiLiveSession).toHaveBeenCalledWith(expect.objectContaining({ token: 'tok' }));
  expect(createWebSpeechSession).not.toHaveBeenCalled();
});

test('createLiveSession routes to Web Speech with the language', () => {
  const handlers = { onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() };
  createLiveSession({ engine: ENGINES.WEB_SPEECH, lang: 'Thai', token: null, ...handlers });

  expect(createWebSpeechSession).toHaveBeenCalledWith(expect.objectContaining({ lang: 'Thai' }));
  expect(createGeminiLiveSession).not.toHaveBeenCalled();
});

test('createLiveSession rejects an unknown engine', () => {
  expect(() => createLiveSession({ engine: 'telepathy' })).toThrow(/unknown engine/i);
});
