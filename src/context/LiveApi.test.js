import { requestLiveToken, reportLiveUsage } from './LiveApi';

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

test('requestLiveToken posts the uid and returns the token payload', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ token: 'auth_tokens/abc', expiresAt: 123, remainingSeconds: 600 }),
  });

  const result = await requestLiveToken('user-1');

  expect(result.token).toBe('auth_tokens/abc');
  const [url, options] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/live-token$/);
  expect(JSON.parse(options.body)).toEqual({ uid: 'user-1' });
});

test('requestLiveToken surfaces status and body on failure', async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 429,
    json: async () => ({ error: 'Live Quota Exceeded', message: 'no seconds left' }),
  });

  await expect(requestLiveToken('user-1')).rejects.toMatchObject({
    status: 429,
    message: 'no seconds left',
  });
});

test('reportLiveUsage rounds seconds up and posts them', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ billedSeconds: 13, liveSecondsToday: 13, liveSecondsLimit: 600 }),
  });

  const result = await reportLiveUsage('user-1', 12.3);

  expect(result.billedSeconds).toBe(13);
  expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({ uid: 'user-1', seconds: 13 });
});

test('reportLiveUsage skips the call for a zero-length session', async () => {
  const result = await reportLiveUsage('user-1', 0);

  expect(global.fetch).not.toHaveBeenCalled();
  expect(result.billedSeconds).toBe(0);
});
