import { toBcp47, LANGUAGE_CODES } from './languageCodes';

test('maps display names to BCP-47 codes', () => {
  expect(toBcp47('Thai')).toBe('th-TH');
  expect(toBcp47('English')).toBe('en-US');
  expect(toBcp47('Japanese')).toBe('ja-JP');
});

test('maps Thai dialect styles onto the Thai code', () => {
  expect(toBcp47('Isan (Northeastern Thai dialect)')).toBe('th-TH');
  expect(toBcp47('Thai Gen Z slang')).toBe('th-TH');
});

test('falls back to en-US for unknown labels', () => {
  expect(toBcp47('Klingon')).toBe('en-US');
  expect(toBcp47(undefined)).toBe('en-US');
});

test('exposes the raw map', () => {
  expect(LANGUAGE_CODES.Korean).toBe('ko-KR');
});
