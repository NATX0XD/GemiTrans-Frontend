import { downsampleTo16k, floatTo16BitPCM, toBase64, TARGET_SAMPLE_RATE } from './pcm';

test('target rate is 16kHz', () => {
  expect(TARGET_SAMPLE_RATE).toBe(16000);
});

test('downsampling 48kHz keeps one sample in three', () => {
  const input = new Float32Array(48000);
  const out = downsampleTo16k(input, 48000);
  expect(out.length).toBe(16000);
});

test('downsampling passes 16kHz audio through untouched', () => {
  const input = new Float32Array([0.1, -0.2, 0.3]);
  const out = downsampleTo16k(input, 16000);
  // Compared against the Float32Array itself: 0.1 as float32 is not 0.1 as a JS number.
  expect(out).toBe(input);
  expect(Array.from(out)).toEqual(Array.from(new Float32Array([0.1, -0.2, 0.3])));
});

test('downsampling preserves the signal, not just the length', () => {
  // 6 samples at 48kHz -> 2 samples at 16kHz, taking every 3rd.
  const input = new Float32Array([1, 0, 0, -1, 0, 0]);
  const out = downsampleTo16k(input, 48000);
  expect(out.length).toBe(2);
  expect(out[0]).toBeCloseTo(1, 5);
  expect(out[1]).toBeCloseTo(-1, 5);
});

test('float samples become little-endian int16', () => {
  const buffer = floatTo16BitPCM(new Float32Array([0, 1, -1]));
  const view = new DataView(buffer);
  expect(buffer.byteLength).toBe(6);
  expect(view.getInt16(0, true)).toBe(0);
  expect(view.getInt16(2, true)).toBe(32767);
  expect(view.getInt16(4, true)).toBe(-32768);
});

test('out-of-range floats clamp instead of wrapping', () => {
  const view = new DataView(floatTo16BitPCM(new Float32Array([2.5, -2.5])));
  expect(view.getInt16(0, true)).toBe(32767);
  expect(view.getInt16(2, true)).toBe(-32768);
});

test('base64 encodes the raw bytes', () => {
  const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
  expect(toBase64(buffer)).toBe('SGVsbG8=');
});
