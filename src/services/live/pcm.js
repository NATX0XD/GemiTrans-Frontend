export const TARGET_SAMPLE_RATE = 16000;

/**
 * Decimate mic audio down to 16kHz. The mic typically runs at 44.1k or 48k;
 * Gemini's live transcription only accepts 16k.
 */
export const downsampleTo16k = (input, inputSampleRate) => {
  if (inputSampleRate === TARGET_SAMPLE_RATE) return input;
  if (inputSampleRate < TARGET_SAMPLE_RATE) {
    throw new Error(`Cannot upsample from ${inputSampleRate}Hz to ${TARGET_SAMPLE_RATE}Hz`);
  }

  const ratio = inputSampleRate / TARGET_SAMPLE_RATE;
  const outLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outLength);

  for (let i = 0; i < outLength; i++) {
    output[i] = input[Math.floor(i * ratio)];
  }

  return output;
};

export const floatTo16BitPCM = (samples) => {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  return buffer;
};

export const toBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};
