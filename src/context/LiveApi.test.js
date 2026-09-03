import { requestLiveToken, reportLiveUsage, prefetchIdToken } from './LiveApi';
import { auth } from '../configuration/firebase';

jest.mock('../configuration/firebase', () => ({
  auth: { currentUser: null },
}));

const jsonResponse = (body, { ok = true, status = 200 } = {}) => ({
  ok,
  status,
  text: async () => JSON.stringify(body),
});

beforeEach(() => {
  global.fetch = jest.fn();
  auth.currentUser = { getIdToken: jest.fn().mockResolvedValue('id-token-abc') };
});

afterEach(() => {
  jest.resetAllMocks();
});

test('requestLiveToken posts the uid and returns the token payload', async () => {
  global.fetch.mockResolvedValue(
    jsonResponse({ token: 'auth_tokens/abc', expiresAt: 123, remainingSeconds: 600 })
  );

  const result = await requestLiveToken('user-1');

  expect(result.token).toBe('auth_tokens/abc');
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/live-token$/);
  expect(JSON.parse(options.body)).toEqual({ uid: 'user-1' });
});

test('requestLiveToken sends the Firebase ID token as a bearer credential', async () => {
  global.fetch.mockResolvedValue(jsonResponse({ token: 'auth_tokens/abc' }));

  await requestLiveToken('user-1');

  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe('Bearer id-token-abc');
});

test('reportLiveUsage sends the Firebase ID token too', async () => {
  global.fetch.mockResolvedValue(jsonResponse({ billedSeconds: 3 }));

  await reportLiveUsage('user-1', 3);

  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe('Bearer id-token-abc');
});

test('a signed-out caller fails with a 401 instead of a TypeError', async () => {
  auth.currentUser = null;

  await expect(requestLiveToken('user-1')).rejects.toMatchObject({ status: 401 });
  expect(global.fetch).not.toHaveBeenCalled();
});

test('requestLiveToken surfaces status and body on failure', async () => {
  global.fetch.mockResolvedValue(
    jsonResponse(
      { error: 'Live Quota Exceeded', message: 'no seconds left' },
      { ok: false, status: 429 }
    )
  );

  await expect(requestLiveToken('user-1')).rejects.toMatchObject({
    status: 429,
    message: 'no seconds left',
  });
});

test('a non-JSON error body still carries the status', async () => {
  // Vercel answers platform failures with an HTML page, not JSON. Parsing it first
  // used to throw a SyntaxError with no .status, so `err.status === 429` never matched.
  global.fetch.mockResolvedValue({
    ok: false,
    status: 504,
    text: async () => '<!DOCTYPE html><title>504 Gateway Timeout</title>',
  });

  await expect(requestLiveToken('user-1')).rejects.toMatchObject({ status: 504 });
});

test('an empty error body still carries the status', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 500, text: async () => '' });

  await expect(requestLiveToken('user-1')).rejects.toMatchObject({ status: 500 });
});

test('reportLiveUsage rounds seconds up and posts them', async () => {
  global.fetch.mockResolvedValue(
    jsonResponse({ billedSeconds: 13, liveSecondsToday: 13, liveSecondsLimit: 600 })
  );

  const result = await reportLiveUsage('user-1', 12.3);

  expect(result.billedSeconds).toBe(13);
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ uid: 'user-1', seconds: 13 });
});

test('reportLiveUsage survives the tab unloading', async () => {
  // Posted from a pagehide handler; a plain fetch is cancelled when the document goes away.
  global.fetch.mockResolvedValue(jsonResponse({ billedSeconds: 5 }));

  await reportLiveUsage('user-1', 5);

  expect(global.fetch.mock.calls[0][1].keepalive).toBe(true);
});

test('reportLiveUsage posts a zero-length session instead of skipping it', async () => {
  // A mint that never produced audio still has a server-side live_session. Only this
  // POST clears it; skipping the call leaves it to be billed as an abandoned session.
  global.fetch.mockResolvedValue(jsonResponse({ billedSeconds: 0, liveSecondsToday: 40 }));

  const result = await reportLiveUsage('user-1', 0);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ uid: 'user-1', seconds: 0 });
  expect(result.billedSeconds).toBe(0);
});

test('reportLiveUsage never posts negative seconds', async () => {
  global.fetch.mockResolvedValue(jsonResponse({ billedSeconds: 0 }));

  await reportLiveUsage('user-1', -12);

  expect(JSON.parse(global.fetch.mock.calls[0][1].body).seconds).toBe(0);
});

test('a pre-fetched token issues the POST without awaiting anything first', async () => {
  // On the unload path nothing after an await is guaranteed to run — the document may
  // already be gone. keepalive only protects a request that was actually issued, so the
  // fetch has to happen in the same synchronous turn as the call.
  global.fetch.mockResolvedValue(jsonResponse({ billedSeconds: 9 }));

  const pending = reportLiveUsage('user-1', 9, { idToken: 'cached-token' });

  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(auth.currentUser.getIdToken).not.toHaveBeenCalled();
  const [, options] = global.fetch.mock.calls[0];
  expect(options.headers.Authorization).toBe('Bearer cached-token');
  expect(options.keepalive).toBe(true);
  await pending;
});

test('without a pre-fetched token the POST still waits for a fresh one', async () => {
  global.fetch.mockResolvedValue(jsonResponse({ billedSeconds: 9 }));

  const pending = reportLiveUsage('user-1', 9);

  expect(global.fetch).not.toHaveBeenCalled();
  await pending;
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test('prefetchIdToken returns the bearer for the unload path', async () => {
  await expect(prefetchIdToken()).resolves.toBe('id-token-abc');
});

test('prefetchIdToken resolves null instead of throwing when signed out', async () => {
  auth.currentUser = null;

  await expect(prefetchIdToken()).resolves.toBeNull();
});
