import { translationErrorKey } from './translateError';

const apiError = ({ status, code }) => {
  const error = new Error('boom');
  error.status = status;
  error.data = code ? { code } : {};
  return error;
};

test('the daily quota keeps its own message and its own modal', () => {
  expect(translationErrorKey(apiError({ status: 429 }))).toBe('quotaExceeded');
});

test('a busy model is not reported as a failure of the app', () => {
  expect(translationErrorKey(apiError({ status: 503, code: 'MODEL_OVERLOADED' }))).toBe('modelBusy');
});

test('a 503 without the code is still an overloaded upstream', () => {
  // Vercel answers its own platform overload with a bare 503 and an HTML body,
  // so there is no code to read — the advice is the same either way.
  expect(translationErrorKey(apiError({ status: 503 }))).toBe('modelBusy');
});

test('everything else stays the generic failure', () => {
  expect(translationErrorKey(apiError({ status: 500 }))).toBe('translationFailed');
  expect(translationErrorKey(apiError({ status: 400 }))).toBe('translationFailed');
  expect(translationErrorKey(new TypeError('Failed to fetch'))).toBe('translationFailed');
  expect(translationErrorKey(null)).toBe('translationFailed');
});
