import { translateTextAPI } from './ControllerApi';

beforeEach(() => {
  global.fetch = jest.fn();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

test('returns the parsed payload on success', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ detected: 'Thai', translations: [{ lang: 'English', text: 'hi' }] }),
  });

  const result = await translateTextAPI({ sourceText: 'สวัสดี', uid: 'user-1' });

  expect(result.detected).toBe('Thai');
  const [, options] = global.fetch.mock.calls[0];
  expect(JSON.parse(options.body)).toEqual({ sourceText: 'สวัสดี', uid: 'user-1' });
});

test('does not send an Authorization header', () => {
  // The translate endpoint is still unauthenticated on the backend.
  global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '{}' });

  return translateTextAPI({ uid: 'user-1' }).then(() => {
    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });
});

test('surfaces status and body on a JSON failure', async () => {
  global.fetch.mockResolvedValue({
    ok: false,
    status: 429,
    text: async () => JSON.stringify({ error: 'Quota Exceeded', message: 'daily limit reached' }),
  });

  await expect(translateTextAPI({ uid: 'user-1' })).rejects.toMatchObject({
    status: 429,
    message: 'daily limit reached',
  });
});

test('an empty 200 is an error, not an empty translation', async () => {
  // Reading text-first stopped this from throwing a SyntaxError, which would have
  // turned a truncated response into a silent "no translation" card.
  global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

  await expect(translateTextAPI({ uid: 'user-1' })).rejects.toThrow();
});

test('an unparseable 200 is an error too', async () => {
  global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '<!DOCTYPE html>' });

  await expect(translateTextAPI({ uid: 'user-1' })).rejects.toThrow();
});

test('a valid but empty JSON object is still returned', async () => {
  // Distinct from the case above: the server did answer with JSON.
  global.fetch.mockResolvedValue({ ok: true, status: 200, text: async () => '{}' });

  await expect(translateTextAPI({ uid: 'user-1' })).resolves.toEqual({});
});

test('a non-JSON error body still carries the status', async () => {
  // TranslationWorkspace branches on err.status === 429; a SyntaxError from parsing
  // Vercel's HTML error page would leave that undefined.
  global.fetch.mockResolvedValue({
    ok: false,
    status: 500,
    text: async () => '<!DOCTYPE html><title>500</title>',
  });

  await expect(translateTextAPI({ uid: 'user-1' })).rejects.toMatchObject({ status: 500 });
});
