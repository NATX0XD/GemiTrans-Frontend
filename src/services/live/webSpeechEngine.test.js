import { createWebSpeechSession, isWebSpeechSupported } from './webSpeechEngine';

class MockRecognition {
  constructor() {
    this.started = 0;
    this.stopped = 0;
    MockRecognition.last = this;
  }
  start() { this.started += 1; }
  stop() { this.stopped += 1; }
  abort() { this.stopped += 1; }
}

const resultEvent = (entries) => ({
  resultIndex: 0,
  results: entries.map(([transcript, isFinal]) => {
    const alternatives = [{ transcript }];
    alternatives.isFinal = isFinal;
    return Object.assign(alternatives, { isFinal, 0: { transcript }, length: 1 });
  }),
});

beforeEach(() => {
  window.webkitSpeechRecognition = MockRecognition;
});

afterEach(() => {
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
});

test('reports support based on the browser global', () => {
  expect(isWebSpeechSupported()).toBe(true);
  delete window.webkitSpeechRecognition;
  expect(isWebSpeechSupported()).toBe(false);
});

test('start configures continuous recognition in the requested language', async () => {
  const session = createWebSpeechSession({ lang: 'Thai', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  const recognition = MockRecognition.last;
  expect(recognition.lang).toBe('th-TH');
  expect(recognition.continuous).toBe(true);
  expect(recognition.interimResults).toBe(true);
  expect(recognition.started).toBe(1);
});

test('interim results go to onPartial, final results to onFinal', async () => {
  const onPartial = jest.fn();
  const onFinal = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial, onFinal, onError: jest.fn() });
  await session.start();

  MockRecognition.last.onresult(resultEvent([['hello wor', false]]));
  expect(onPartial).toHaveBeenCalledWith('hello wor');
  expect(onFinal).not.toHaveBeenCalled();

  MockRecognition.last.onresult(resultEvent([['hello world', true]]));
  expect(onFinal).toHaveBeenCalledWith({ text: 'hello world' });
});

test('blank final results are ignored', async () => {
  const onFinal = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal, onError: jest.fn() });
  await session.start();

  MockRecognition.last.onresult(resultEvent([['   ', true]]));
  expect(onFinal).not.toHaveBeenCalled();
});

test('recognition restarts itself while the session is active', async () => {
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(2);
});

test('recognition does not restart after stop', async () => {
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();
  session.stop();

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(1);
});

test('permission errors reach onError and stop the session', async () => {
  const onError = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  MockRecognition.last.onerror({ error: 'not-allowed' });
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'not-allowed' }));

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(1);
});

test('no-speech errors are ignored so the session keeps listening', async () => {
  const onError = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  MockRecognition.last.onerror({ error: 'no-speech' });
  expect(onError).not.toHaveBeenCalled();

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(2);
});

test('start throws when the browser has no support', async () => {
  delete window.webkitSpeechRecognition;
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });

  await expect(session.start()).rejects.toThrow(/not supported/i);
});
