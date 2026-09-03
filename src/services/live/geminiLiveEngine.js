import { GoogleGenAI, Modality } from '@google/genai';
import { downsampleTo16k, floatTo16BitPCM, toBase64, TARGET_SAMPLE_RATE } from './pcm';

export const LIVE_MODEL = 'gemini-3.5-transcribe-live';

const BUFFER_SIZE = 4096;

export const isGeminiLiveSupported = () =>
  Boolean(navigator.mediaDevices?.getUserMedia) && Boolean(window.AudioContext || window.webkitAudioContext);

export const createGeminiLiveSession = ({ token, onPartial, onFinal, onError }) => {
  let liveSession = null;
  let audioContext = null;
  let processor = null;
  let sourceNode = null;
  let stream = null;
  let closing = false;

  const releaseAudio = async () => {
    processor?.disconnect();
    sourceNode?.disconnect();
    stream?.getTracks().forEach((track) => track.stop());
    if (audioContext) await audioContext.close();
    processor = null;
    sourceNode = null;
    stream = null;
    audioContext = null;
  };

  const start = async () => {
    closing = false;

    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
    });

    const ai = new GoogleGenAI({ apiKey: token });

    liveSession = await ai.live.connect({
      model: LIVE_MODEL,
      config: {
        responseModalities: [Modality.TEXT],
        inputAudioTranscription: { languageCodes: [], mode: 'VERBATIM' },
      },
      callbacks: {
        onmessage: (message) => {
          const content = message?.serverContent;
          const interim = content?.interimInputTranscription?.text;
          const final = content?.inputTranscription?.text;
          if (interim?.trim()) onPartial(interim);
          if (final?.trim()) onFinal({ text: final.trim() });
        },
        onerror: (err) => onError(err instanceof Error ? err : new Error(String(err?.message || err))),
        onclose: (event) => {
          if (closing) return;
          onError(new Error(`Live session closed unexpectedly: ${event?.reason || 'unknown reason'}`));
        },
      },
    });

    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtor();
    sourceNode = audioContext.createMediaStreamSource(stream);
    processor = audioContext.createScriptProcessor(BUFFER_SIZE, 1, 1);

    processor.onaudioprocess = (event) => {
      if (closing || !liveSession) return;
      const samples = event.inputBuffer.getChannelData(0);
      const downsampled = downsampleTo16k(samples, audioContext.sampleRate);
      const base64 = toBase64(floatTo16BitPCM(downsampled));
      liveSession.sendRealtimeInput({
        audio: { data: base64, mimeType: `audio/pcm;rate=${TARGET_SAMPLE_RATE}` },
      });
    };

    sourceNode.connect(processor);
    processor.connect(audioContext.destination);
  };

  const stop = async () => {
    closing = true;
    await releaseAudio();
    liveSession?.close();
    liveSession = null;
  };

  return { start, stop };
};
