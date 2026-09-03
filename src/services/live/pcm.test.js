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

test('downsampling averages each source window instead of point-sampling', () => {
  // 6 samples at 48kHz -> 2 samples at 16kHz, each the mean of its 3 source samples.
  const input = new Float32Array([1, 0, 0, -1, 0, 0]);
  const out = downsampleTo16k(input, 48000);
  expect(out.length).toBe(2);
  expect(out[0]).toBeCloseTo(1 / 3, 5);
  expect(out[1]).toBeCloseTo(-1 / 3, 5);
});

const sine = (freq, sampleRate, length) => {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate);
  return out;
};

const rms = (samples) => {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
};

test('downsampling attenuates above the 8kHz Nyquist without eating speech', () => {
  // 12kHz cannot be represented at 16kHz. Naive decimation folds it down to 4kHz at
  // full amplitude (rms ratio 1.0), straight onto speech formants.
  const aliasing = sine(12000, 48000, 4800);
  const aliasingOut = downsampleTo16k(aliasing, 48000);
  expect(aliasingOut.length).toBe(1600);
  expect(rms(aliasingOut)).toBeLessThan(rms(aliasing) * 0.5);

  // The other half of the guard: a frequency well under the limit, on the 44.1kHz
  // non-integer-ratio path, must survive. Stops "fix the aliasing" from becoming
  // a filter that also removes the voice.
  const speech = sine(300, 44100, 4410);
  const speechOut = downsampleTo16k(speech, 44100);
  expect(speechOut.length).toBe(1600);
  expect(rms(speechOut)).toBeGreaterThan(rms(speech) * 0.95);
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
