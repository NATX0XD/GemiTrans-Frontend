# Live Real-Time Translate — Design

Date: 2026-09-03
Status: approved for planning

## Goal

Add a Maestra-style real-time speech translation page at `/live`: speak into the mic, see the
transcript stream in, get each finished utterance translated and (optionally) spoken back.

Reference UI: https://app.maestra.ai/real-time — mode tabs, language pair with swap, two-way
toggle, one big round mic button.

## Scope

In scope for this iteration:

- Translate mode only (speech in → text out, translated).
- Two speech-to-text engines: browser Web Speech API and Gemini Live API.
- Two-way translation.
- Optional text-to-speech of the translated result, on by default.
- Session transcript saved to history on stop.
- Separate daily quota bucket for Live audio.

Out of scope (tabs rendered but disabled, labeled "coming soon"):

- Transcribe mode (speech → same-language text, no translation).
- Dubbing mode (voice-to-voice output using Gemini native audio).

## Current system

- Frontend: CRA + React 19, Tailwind, HeroUI, `react-router-dom`, Firebase auth/Firestore.
- Backend: `translator-api/` — Vercel serverless. `api/translate.js` calls Gemini
  `gemini-3.1-flash-lite-preview` for text translation and meters usage into
  `users_quota/{uid}.tokens_today` against `daily_limit` (10,000).
- `src/services/speechService.js` already does TTS via the Web Speech API.
- No speech-to-text anywhere in the codebase today. This is the main thing being added.

## Architecture

### Engine abstraction

`src/services/live/` exposes one interface both engines implement:

```js
createLiveSession({ engine, lang, onPartial, onFinal, onError }) // -> { start, stop }
```

- `onPartial(text)` — interim, unstable text. Rendered greyed out, never translated, never saved.
- `onFinal({ text, lang })` — a settled utterance. Triggers translation.
- `onError(err)` — engine-level failure. Drives fallback and the error banner.

Implementations:

- `webSpeechEngine.js` — wraps `webkitSpeechRecognition` with `continuous: true` and
  `interimResults: true`. Chrome ends recognition on its own after silence, so `onend`
  auto-restarts while the session is active. Requires an explicit `lang` (BCP-47), reusing the
  `languageMap` already in `speechService.js`.
- `geminiLiveEngine.js` — `getUserMedia` → a `ScriptProcessorNode` tap that downsamples to raw
  PCM16, 16 kHz, mono, little-endian → `@google/genai`'s `ai.live.connect` against
  `gemini-3.5-transcribe-live`,
  authenticated with an ephemeral token. Audio is sent in 100 ms chunks as
  `sendRealtimeInput({ audio: { data: <base64>, mimeType: 'audio/pcm;rate=16000' } })`.

Session config:

```js
{
  responseModalities: [Modality.TEXT],
  inputAudioTranscription: { languageCodes: [], mode: 'VERBATIM' },
}
```

`languageCodes: []` turns on automatic language detection across utterances.

Incoming messages:

- `message.serverContent.interimInputTranscription.text` → `onPartial`
- `message.serverContent.inputTranscription.text` → `onFinal` (emitted when the speaker pauses)

### Gemini does speech-to-text only

`gemini-3.5-transcribe-live` is a transcription-only model — it never generates a conversational
reply, so there is no wasted output audio to pay for. Every final utterance from either engine goes
through the existing `translateTextAPI` in `src/context/ControllerApi.js`.

Reasons:

- One translation code path shared with `/app`, so formality/objective settings behave the same.
- Token metering keeps working through the existing `api/translate.js` logic.
- Cost: audio input only, $0.005/min, and there is a free tier.

Google caps a live transcription session at 10 minutes, which lines up with the 600-second daily
budget below — one uninterrupted session can use the whole day's allowance and no more.

The frontend gains one dependency: `@google/genai`. The legacy `@google/generative-ai` package the
backend uses has no Live API support. Hand-rolling the Live WebSocket protocol is not worth it.

### Engine selection and fallback

A toggle on the page: "High quality mode (Gemini Live)", default on when available.

Resolution order at session start:

1. High quality mode on, `/api/live-token` returns a token → Gemini Live.
2. Token request fails, quota exhausted, or the WSS drops twice → fall back to Web Speech, show a
   toast naming the reason.
3. Web Speech unavailable too (Safari, Firefox) → error banner, mic button disabled.

A dropped WSS falls straight back to Web Speech rather than reconnecting. Reconnecting into the same
Live session requires a `sessionResumption` handle, and the ephemeral token is minted with `uses: 1`
so a naive second connect would be rejected anyway. Resumption is worth adding later; it is not in
this iteration.

### Two-way translation

The transcription messages carry text but no detected language code, so direction is resolved on
the translation side instead. `api/translate.js` already detects and returns the source language.
It gains an optional `twoWay: true` flag: with two entries in `targets`, the system instruction
tells the model to translate into whichever of the two is *not* the source, and return that single
translation. No extra call, no wasted tokens translating a sentence into its own language.

- Gemini engine: automatic language detection means both people share one mic and speak freely.
- Web Speech: cannot auto-detect — `lang` must be fixed before recognition starts. Two-way there
  renders two mic buttons, one per side, each locking recognition to that side's language. The
  translation call still passes `twoWay`, so the direction logic stays identical across engines.

## Components

New, under `src/components/Main/Live/`:

| Component | Responsibility |
|---|---|
| `LiveWorkspace.js` | Owns session state, engine lifecycle, utterance list, quota checks |
| `ModeTabs.js` | Transcribe / Translate / Dubbing pills; only Translate enabled |
| `LanguagePairBar.js` | Source select, swap button, target select |
| `TwoWayToggle.js` | Two-way switch plus info tooltip |
| `MicButton.js` | Round record button; renders two buttons in Web Speech two-way mode |
| `TranscriptStream.js` | Utterance list — source line, translated line, greyed interim line |

`src/page/LivePage.jsx` composes them, routed under `MainLayout` in `App.js`.

Reused as-is: `LanguageSelectorModal`, `configuration/availableLanguages.js`,
`QuotaExceededModal`, `speechService.speakText`, `historyService.appendTranslationHistory`.

## Backend

Two new endpoints in `translator-api/api/`, following the CORS + Firebase Admin pattern already in
`translate.js`.

### `POST /api/live-token`

Request: `{ uid }`

1. Reject when `uid` is missing.
2. Read `users_quota/{uid}`; reset the daily counters when `last_reset_date` is not today (same
   rule `translate.js` uses).
3. Reject with 429 when `live_seconds_today >= live_seconds_limit`.
4. Mint an ephemeral auth token by POSTing to
   `https://generativelanguage.googleapis.com/v1beta/auth_tokens` with the `x-goog-api-key` header
   set to `GEMINI_API_KEY` and a body of `{ uses: 1, expireTime, newSessionExpireTime,
   liveConnectConstraints: { model: 'gemini-3.5-transcribe-live' } }`. `expireTime` is 10 minutes
   out, `newSessionExpireTime` 1 minute out. Plain `fetch` — no new backend dependency.
5. Bill any pre-existing **confirmed** `live_session` as abandoned, then store
   `live_session = { mintedAt: <server timestamp>, ttlSeconds: 600, confirmed: false }`.
6. Respond `{ token, expiresAt, remainingSeconds }`, where `token` is the returned `name` field.
   The browser passes it to `new GoogleGenAI({ apiKey: token })`.

All three live endpoints require `Authorization: Bearer <Firebase ID token>`; the uid comes from the
verified token and any uid in the body is ignored. `/api/translate` keeps its existing body-uid
behavior for now — tightening it is a separate change with its own client migration.

### `POST /api/live-confirm`

Empty body. Marks the current `live_session` as `confirmed: true`.

The client calls this once `session.start()` has resolved, meaning the microphone was granted and
the socket is open. Abandoned-session billing (below) charges only confirmed sessions, so a mint
that never became a session — denied microphone, a lost HTTP response, a tab closed between mint and
first word — costs the user nothing. Without it, any of those would bill up to the full 600-second
TTL at the next mint and lock the user out of Live for the rest of the day.

### `POST /api/live-usage`

Request: `{ uid, seconds }`

The client reports its own session length, so the server clamps before trusting it:

```
billable = min(seconds, now - live_session.mintedAt, live_session.ttlSeconds,
               live_seconds_limit - live_seconds_today)
```

Then `live_seconds_today += billable` and clear `live_session`. Responds with the updated counters.

The client posts this on stop, and also from a `visibilitychange`/`pagehide` handler so an abandoned
tab still gets billed.

## Quota model

Live audio gets its own bucket, separate from the text token budget:

| Field | Default | Meaning |
|---|---|---|
| `tokens_today` | 0 | Existing text translation tokens |
| `daily_limit` | 10000 | Existing text token cap — unchanged |
| `live_seconds_today` | 0 | Live audio seconds used today |
| `live_seconds_limit` | 600 | 10 minutes per user per day |

Both reset off the same `last_reset_date`, through one shared helper that `/api/translate` and the
live endpoints all go through. They must not each own a copy of the reset rule: whichever endpoint
ran first would consume the flag and leave the other bucket un-reset, which silently locks the user
out of the un-reset feature for the day.

Read these fields with `??`, never `||`. `live_seconds_limit: 0` is how an operator suspends a
user's Live access, and `0 || 600` hands them the full default instead.

Rationale: 10 minutes of Live audio is roughly 19,200 tokens at Gemini's 32 tokens/second audio
input rate — nearly twice the whole daily text budget. Sharing one bucket would let a single Live
session lock the user out of text translation entirely.

Note that translating what Live transcribes still consumes `tokens_today` normally, because it goes
through `api/translate.js` like everything else. So a Live session draws on both buckets: seconds
for the audio, tokens for the translation.

`useQuota` gains `liveSecondsUsed` / `liveSecondsLimit` / `isLiveOverLimit`, and the quota UI shows
two bars.

## Data flow

1. User picks languages, presses the mic.
2. `LiveWorkspace` requests a token (Gemini path) or starts `webkitSpeechRecognition` directly.
3. Interim text streams into `TranscriptStream` as a greyed pending line.
4. On final: append the utterance, call `translateTextAPI({ sourceText, targets: [target], uid })`,
   attach the result to that utterance, and speak it if TTS is on.
5. On stop: post `/api/live-usage`, then write the whole session to history in one call.

History items match the shape `TranslationWorkspace.js` already writes, so `HistoryPage` needs no
changes:

```js
{ sourceText, sourceLang, translatedText, targetLang, objective, formality }
```

One `appendTranslationHistory(uid, items)` call per session — a single Firestore write regardless of
how many utterances were spoken.

## Error handling

| Case | Behavior |
|---|---|
| Mic permission denied | Inline banner with a retry button; mic disabled until granted |
| No engine available | Banner explaining Chrome/Edge is required; mic disabled |
| WSS drop | Fall back to Web Speech with a toast (no in-session reconnect — see above) |
| Token request 429 | `QuotaExceededModal`, worded for the Live seconds bucket |
| Translate 429 mid-session | Keep transcribing, mark affected utterances as untranslated, show the modal once |
| Translate network failure | Per-utterance retry button; the rest of the session continues |

No failure silently drops an utterance — every one either shows a translation or an explicit
failure state.

## i18n

New zone `src/i18n/zones/live.js` with `{ en, th }`, registered in the `ZONES` array in
`src/i18n/translations.js`. `nav.live` is added to `src/i18n/zones/nav.js`.

## Testing

Automated (jest + RTL, already configured):

- `webSpeechEngine` against a mocked `SpeechRecognition`: interim vs final routing, auto-restart on
  `onend` while active, no restart after stop.
- PCM downsample helper as a pure function: sample rate conversion and PCM16 encoding.
- Two-way direction logic: given a detected language and a configured pair, pick the target.
- `live-usage` clamping: over-reported seconds, expired sessions, and the remaining-quota ceiling.
- `LiveWorkspace` with mocked engine and API: an utterance renders, translates, and is saved.

Manual (needs a real mic, Chrome desktop):

- End-to-end EN → TH and TH → EN with TTS on.
- Two-way in both engine modes.
- Quota exhaustion at the 600-second boundary.

## Open dependency

`gemini-3.5-transcribe-live` has a free tier, so the existing `GEMINI_API_KEY` on Vercel should be
enough. If `/api/live-token` comes back with a quota or permission error anyway, the key needs
billing enabled — until then the page still works, but only on the Web Speech path with the high
quality toggle off. Task 4 surfaces that error verbatim rather than hiding it.

## References

- Live transcription: https://ai.google.dev/gemini-api/docs/live-api/live-transcribe
- Ephemeral tokens: https://ai.google.dev/gemini-api/docs/ephemeral-tokens
- Live API: https://ai.google.dev/gemini-api/docs/live
- Pricing: https://ai.google.dev/gemini-api/docs/pricing
