# Live Real-Time Translate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `/live` page where the user speaks into their mic and sees each finished utterance transcribed, translated, and optionally spoken back.

**Architecture:** Two interchangeable speech-to-text engines behind one `createLiveSession` interface — the browser's Web Speech API (free, Chrome/Edge only) and Gemini's `gemini-3.5-transcribe-live` reached directly from the browser with a short-lived token minted by the existing Vercel backend. Both engines emit plain text; every finished utterance is translated by the existing `/api/translate` endpoint, so there is exactly one translation code path in the app. Live audio is metered in seconds in its own daily quota bucket, separate from the existing text token budget.

**Tech Stack:** React 19 (CRA 5), Tailwind, HeroUI, lucide-react, framer-motion, Firebase auth/Firestore, jest + React Testing Library, Vercel serverless functions (ESM, `firebase-admin`), `@google/genai`.

**Spec:** `docs/superpowers/specs/2026-09-03-live-realtime-translate-design.md`

## Global Constraints

- Gemini transcription model: `gemini-3.5-transcribe-live`. Do not use `gemini-3.1-flash-live-preview` — it bills for generated audio output this feature does not need.
- Live audio format: raw 16-bit PCM, 16 kHz, mono, little-endian, sent in 100 ms chunks with MIME type `audio/pcm;rate=16000`.
- Ephemeral token endpoint: `https://generativelanguage.googleapis.com/v1beta/auth_tokens`, authenticated with the `x-goog-api-key` header.
- Daily Live budget: `live_seconds_limit` defaults to `600` seconds per user. It is a separate Firestore field from `tokens_today` / `daily_limit`, which keep their existing meaning and their existing 10,000 default.
- Google caps a single live transcription session at 10 minutes.
- The backend adds no new npm dependencies — token minting uses plain `fetch`.
- The frontend adds exactly one dependency: `@google/genai`.
- Language values throughout the app are English display names (`'English'`, `'Thai'`), matching `src/configuration/availableLanguages.js`. BCP-47 codes are only used at the browser speech boundary.
- All user-facing strings go through `t()` with keys in `src/i18n/zones/live.js`. No hardcoded copy in components.
- Frontend tests run with `CI=true npx react-scripts test --watchAll=false`. Backend tests run with `npm test` inside `translator-api/`.
- No utterance is ever silently dropped. Every one ends up showing either a translation or an explicit error state with a retry.

---

### Task 1: Project baseline

Nothing can be verified until dependencies are installed and the test suite is green. The repo ships with the stale CRA starter test, which asserts on a "learn react" link that no longer exists anywhere in the app — it fails, and leaving it makes every later "run the tests" step ambiguous.

**Files:**
- Modify: `package.json`
- Delete: `src/App.test.js`

- [ ] **Step 1: Install existing dependencies**

Run: `npm install`
Expected: completes, `node_modules/` now exists.

- [ ] **Step 2: Confirm the stale starter test fails**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: FAIL — `src/App.test.js` reports `Unable to find an element with the text: /learn react/i`.

- [ ] **Step 3: Delete the stale starter test**

```bash
rm src/App.test.js
```

- [ ] **Step 4: Add the Gemini SDK**

Run: `npm install @google/genai`
Expected: `@google/genai` appears in `package.json` dependencies.

- [ ] **Step 5: Confirm a green baseline**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS — "No tests found" is the expected and acceptable result here.

- [ ] **Step 6: Confirm the app still builds with the new dependency**

Run: `CI=true npx react-scripts build`
Expected: "Compiled successfully" (warnings are fine).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json
git rm --cached src/App.test.js
git commit -m "chore: install deps, add @google/genai, drop stale CRA starter test"
```

---

### Task 2: Backend quota helpers

The billing math is the only part of the backend worth unit testing, so it lives in its own module. `translator-api` has no test runner today; Node 24's built-in `node --test` needs no dependency.

**Files:**
- Create: `translator-api/lib/liveQuota.js`
- Create: `translator-api/lib/liveQuota.test.js`
- Modify: `translator-api/package.json`

**Interfaces:**
- Produces:
  - `LIVE_SECONDS_LIMIT: number` — 600
  - `todayString(date: Date): string` — `'YYYY-MM-DD'`
  - `normalizeQuota(data: object | null, todayStr: string): { tokens_today, daily_limit, live_seconds_today, live_seconds_limit, last_reset_date, wasReset }`
  - `clampBillableSeconds({ reported, mintedAtMs, nowMs, ttlSeconds, used, limit }): number`

- [ ] **Step 1: Add the test script**

In `translator-api/package.json`, replace the `scripts` block:

```json
  "scripts": {
    "test": "node --test lib/*.test.js"
  },
```

- [ ] **Step 2: Write the failing tests**

Create `translator-api/lib/liveQuota.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LIVE_SECONDS_LIMIT,
  todayString,
  normalizeQuota,
  clampBillableSeconds,
} from './liveQuota.js';

test('todayString formats as YYYY-MM-DD', () => {
  assert.equal(todayString(new Date('2026-09-03T18:22:00Z')), '2026-09-03');
});

test('normalizeQuota fills defaults for a brand new user', () => {
  const q = normalizeQuota(null, '2026-09-03');
  assert.equal(q.tokens_today, 0);
  assert.equal(q.daily_limit, 10000);
  assert.equal(q.live_seconds_today, 0);
  assert.equal(q.live_seconds_limit, LIVE_SECONDS_LIMIT);
  assert.equal(q.last_reset_date, '2026-09-03');
  assert.equal(q.wasReset, true);
});

test('normalizeQuota keeps counters when the date still matches', () => {
  const q = normalizeQuota(
    { tokens_today: 500, daily_limit: 10000, live_seconds_today: 90, live_seconds_limit: 600, last_reset_date: '2026-09-03' },
    '2026-09-03'
  );
  assert.equal(q.tokens_today, 500);
  assert.equal(q.live_seconds_today, 90);
  assert.equal(q.wasReset, false);
});

test('normalizeQuota zeroes both counters on a new day', () => {
  const q = normalizeQuota(
    { tokens_today: 9000, live_seconds_today: 600, last_reset_date: '2026-09-02' },
    '2026-09-03'
  );
  assert.equal(q.tokens_today, 0);
  assert.equal(q.live_seconds_today, 0);
  assert.equal(q.last_reset_date, '2026-09-03');
  assert.equal(q.wasReset, true);
});

test('normalizeQuota preserves a custom live limit', () => {
  const q = normalizeQuota({ live_seconds_limit: 1800, last_reset_date: '2026-09-03' }, '2026-09-03');
  assert.equal(q.live_seconds_limit, 1800);
});

test('clampBillableSeconds trusts an honest report', () => {
  const billable = clampBillableSeconds({
    reported: 42, mintedAtMs: 1000, nowMs: 1000 + 60_000, ttlSeconds: 600, used: 0, limit: 600,
  });
  assert.equal(billable, 42);
});

test('clampBillableSeconds caps an over-report at real elapsed time', () => {
  const billable = clampBillableSeconds({
    reported: 9999, mintedAtMs: 1000, nowMs: 1000 + 30_000, ttlSeconds: 600, used: 0, limit: 600,
  });
  assert.equal(billable, 30);
});

test('clampBillableSeconds caps at the token TTL', () => {
  const billable = clampBillableSeconds({
    reported: 5000, mintedAtMs: 0, nowMs: 4_000_000, ttlSeconds: 600, used: 0, limit: 600,
  });
  assert.equal(billable, 600);
});

test('clampBillableSeconds caps at remaining daily quota', () => {
  const billable = clampBillableSeconds({
    reported: 120, mintedAtMs: 0, nowMs: 600_000, ttlSeconds: 600, used: 550, limit: 600,
  });
  assert.equal(billable, 50);
});

test('clampBillableSeconds returns 0 when the bucket is already empty', () => {
  const billable = clampBillableSeconds({
    reported: 120, mintedAtMs: 0, nowMs: 600_000, ttlSeconds: 600, used: 600, limit: 600,
  });
  assert.equal(billable, 0);
});

test('clampBillableSeconds returns 0 without a minted session', () => {
  const billable = clampBillableSeconds({
    reported: 120, mintedAtMs: null, nowMs: 600_000, ttlSeconds: 600, used: 0, limit: 600,
  });
  assert.equal(billable, 0);
});

test('clampBillableSeconds rejects junk reports', () => {
  for (const reported of [-5, 0, NaN, undefined, 'abc']) {
    assert.equal(
      clampBillableSeconds({ reported, mintedAtMs: 0, nowMs: 60_000, ttlSeconds: 600, used: 0, limit: 600 }),
      0
    );
  }
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd translator-api && npm test`
Expected: FAIL — `Cannot find module ... lib/liveQuota.js`.

- [ ] **Step 4: Write the implementation**

Create `translator-api/lib/liveQuota.js`:

```js
export const LIVE_SECONDS_LIMIT = 600;
export const DEFAULT_TOKEN_LIMIT = 10000;

export const todayString = (date) => date.toISOString().split('T')[0];

export const normalizeQuota = (data, todayStr) => {
  const source = data || {};
  const isNewDay = source.last_reset_date !== todayStr;

  return {
    tokens_today: isNewDay ? 0 : (source.tokens_today || 0),
    daily_limit: source.daily_limit || DEFAULT_TOKEN_LIMIT,
    live_seconds_today: isNewDay ? 0 : (source.live_seconds_today || 0),
    live_seconds_limit: source.live_seconds_limit || LIVE_SECONDS_LIMIT,
    last_reset_date: todayStr,
    wasReset: isNewDay,
  };
};

export const clampBillableSeconds = ({ reported, mintedAtMs, nowMs, ttlSeconds, used, limit }) => {
  const asked = Number(reported);
  if (!Number.isFinite(asked) || asked <= 0) return 0;
  if (!Number.isFinite(Number(mintedAtMs))) return 0;

  const elapsed = Math.ceil((nowMs - mintedAtMs) / 1000);
  if (elapsed <= 0) return 0;

  const remaining = limit - used;
  if (remaining <= 0) return 0;

  return Math.max(0, Math.min(asked, elapsed, ttlSeconds, remaining));
};
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd translator-api && npm test`
Expected: PASS — all 11 tests pass.

- [ ] **Step 6: Commit**

```bash
git add translator-api/lib/liveQuota.js translator-api/lib/liveQuota.test.js translator-api/package.json
git commit -m "feat(api): add live quota helpers with node:test coverage"
```

---

### Task 3: `/api/live-token` endpoint

**Files:**
- Create: `translator-api/api/live-token.js`

**Interfaces:**
- Consumes: `normalizeQuota`, `todayString`, `LIVE_SECONDS_LIMIT` from Task 2.
- Produces: `POST /api/live-token` with body `{ uid }` returning `{ token, expiresAt, remainingSeconds }`, or 429 `{ error: 'Live Quota Exceeded', message, remainingSeconds: 0 }`.

- [ ] **Step 1: Write the endpoint**

Create `translator-api/api/live-token.js`:

```js
import admin from "firebase-admin";
import { normalizeQuota, todayString } from "../lib/liveQuota.js";

const TOKEN_TTL_SECONDS = 600;
const SESSION_START_WINDOW_SECONDS = 60;
const LIVE_MODEL = "gemini-3.5-transcribe-live";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin Init Error:", error.stack);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Use POST' });

  const { uid } = req.body;
  if (!uid) return res.status(400).json({ error: "Unauthorized: Missing User ID" });

  try {
    const quotaRef = db.collection("users_quota").doc(uid);
    const quotaSnap = await quotaRef.get();
    const todayStr = todayString(new Date());
    const quota = normalizeQuota(quotaSnap.exists ? quotaSnap.data() : null, todayStr);

    const remainingSeconds = quota.live_seconds_limit - quota.live_seconds_today;
    if (remainingSeconds <= 0) {
      return res.status(429).json({
        error: "Live Quota Exceeded",
        message: `You have used your daily live translation allowance (${quota.live_seconds_limit} seconds). Please come back tomorrow.`,
        remainingSeconds: 0,
      });
    }

    const now = Date.now();
    const tokenResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/auth_tokens",
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uses: 1,
          expireTime: new Date(now + TOKEN_TTL_SECONDS * 1000).toISOString(),
          newSessionExpireTime: new Date(now + SESSION_START_WINDOW_SECONDS * 1000).toISOString(),
          liveConnectConstraints: { model: LIVE_MODEL },
        }),
      }
    );

    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text();
      console.error("Ephemeral token mint failed:", tokenResponse.status, detail);
      return res.status(502).json({
        error: "Live Token Failed",
        message: `Gemini rejected the token request (${tokenResponse.status}): ${detail}`,
      });
    }

    const tokenData = await tokenResponse.json();

    await quotaRef.set({
      tokens_today: quota.tokens_today,
      daily_limit: quota.daily_limit,
      live_seconds_today: quota.live_seconds_today,
      live_seconds_limit: quota.live_seconds_limit,
      last_reset_date: quota.last_reset_date,
      live_session: { mintedAt: now, ttlSeconds: TOKEN_TTL_SECONDS },
    }, { merge: true });

    return res.status(200).json({
      token: tokenData.name,
      expiresAt: now + TOKEN_TTL_SECONDS * 1000,
      remainingSeconds: Math.min(remainingSeconds, TOKEN_TTL_SECONDS),
    });
  } catch (error) {
    console.error("live-token Error:", error.message);
    return res.status(500).json({ error: "Live Token Failed", message: error.message });
  }
}
```

The Gemini error body is passed through verbatim in the 502 rather than swallowed — if the API key lacks billing or Live access, that message is the only way to find out.

- [ ] **Step 2: Verify against the deployed backend**

Deploy the `translator-api` project, then run with a real uid from Firebase auth:

```bash
curl -s -X POST https://translator-api-iota.vercel.app/api/live-token \
  -H 'Content-Type: application/json' \
  -d '{"uid":"<REAL_FIREBASE_UID>"}' | head -c 400
```

Expected: JSON containing `"token":"auth_tokens/..."`, `expiresAt`, and `remainingSeconds` (600 on the first call of the day).

If it returns 502, read the passed-through Gemini message — that is the billing/permission signal called out in the spec. Stop and report it rather than working around it.

- [ ] **Step 3: Verify the rejection path**

```bash
curl -s -X POST https://translator-api-iota.vercel.app/api/live-token \
  -H 'Content-Type: application/json' -d '{}'
```

Expected: HTTP 400 with `{"error":"Unauthorized: Missing User ID"}`.

- [ ] **Step 4: Commit**

```bash
git add translator-api/api/live-token.js
git commit -m "feat(api): mint ephemeral Gemini live tokens with quota gating"
```

---

### Task 4: `/api/live-usage` endpoint

**Files:**
- Create: `translator-api/api/live-usage.js`

**Interfaces:**
- Consumes: `normalizeQuota`, `todayString`, `clampBillableSeconds` from Task 2.
- Produces: `POST /api/live-usage` with body `{ uid, seconds }` returning `{ billedSeconds, liveSecondsToday, liveSecondsLimit }`.

- [ ] **Step 1: Write the endpoint**

Create `translator-api/api/live-usage.js`:

```js
import admin from "firebase-admin";
import { normalizeQuota, todayString, clampBillableSeconds } from "../lib/liveQuota.js";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin Init Error:", error.stack);
  }
}

const db = admin.firestore();

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Use POST' });

  const { uid, seconds } = req.body;
  if (!uid) return res.status(400).json({ error: "Unauthorized: Missing User ID" });

  try {
    const quotaRef = db.collection("users_quota").doc(uid);
    const quotaSnap = await quotaRef.get();
    const todayStr = todayString(new Date());
    const quota = normalizeQuota(quotaSnap.exists ? quotaSnap.data() : null, todayStr);
    const session = (quotaSnap.exists && quotaSnap.data().live_session) || {};

    const billedSeconds = clampBillableSeconds({
      reported: seconds,
      mintedAtMs: session.mintedAt ?? null,
      nowMs: Date.now(),
      ttlSeconds: session.ttlSeconds ?? 600,
      used: quota.live_seconds_today,
      limit: quota.live_seconds_limit,
    });

    await quotaRef.set({
      tokens_today: quota.tokens_today,
      daily_limit: quota.daily_limit,
      live_seconds_today: quota.live_seconds_today + billedSeconds,
      live_seconds_limit: quota.live_seconds_limit,
      last_reset_date: quota.last_reset_date,
      live_session: admin.firestore.FieldValue.delete(),
    }, { merge: true });

    return res.status(200).json({
      billedSeconds,
      liveSecondsToday: quota.live_seconds_today + billedSeconds,
      liveSecondsLimit: quota.live_seconds_limit,
    });
  } catch (error) {
    console.error("live-usage Error:", error.message);
    return res.status(500).json({ error: "Live Usage Failed", message: error.message });
  }
}
```

Clearing `live_session` is what makes a token single-use for billing: a replayed usage report finds no minted session and bills 0.

- [ ] **Step 2: Verify the happy path**

Mint a token first (Task 3 step 2), wait ~5 seconds, then:

```bash
curl -s -X POST https://translator-api-iota.vercel.app/api/live-usage \
  -H 'Content-Type: application/json' \
  -d '{"uid":"<REAL_FIREBASE_UID>","seconds":5}'
```

Expected: `{"billedSeconds":5,"liveSecondsToday":5,"liveSecondsLimit":600}`.

- [ ] **Step 3: Verify the replay is refused**

Repeat the exact same curl without minting a new token.
Expected: `"billedSeconds":0` and `liveSecondsToday` unchanged at 5.

- [ ] **Step 4: Verify over-reporting is clamped**

Mint a fresh token, wait ~3 seconds, then report 9999 seconds.
Expected: `billedSeconds` around 3-5, never 9999.

- [ ] **Step 5: Commit**

```bash
git add translator-api/api/live-usage.js
git commit -m "feat(api): meter live audio seconds with server-side clamping"
```

---

### Task 5: Two-way translation direction on the backend

The transcription stream carries text but no language code, so the translation call decides direction. `api/translate.js` already detects the source language; it gains a `twoWay` flag telling the model to translate into whichever of the two supplied targets is not the source.

**Files:**
- Create: `translator-api/lib/prompt.js`
- Create: `translator-api/lib/prompt.test.js`
- Modify: `translator-api/api/translate.js:31` and `:84-88`

**Interfaces:**
- Produces: `buildSystemInstruction(twoWay: boolean): string`
- Produces: `POST /api/translate` accepts an optional `twoWay: true`; with two entries in `targets` the response has exactly one entry in `translations`.

- [ ] **Step 1: Write the failing test**

Create `translator-api/lib/prompt.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSystemInstruction } from './prompt.js';

test('default instruction is unchanged for the normal path', () => {
  assert.equal(
    buildSystemInstruction(false),
    "Expert Translator. Detect source language (English name). Translate by Formality(0-100) & Objective per target."
  );
});

test('two-way instruction asks for a single non-source translation', () => {
  const instruction = buildSystemInstruction(true);
  assert.match(instruction, /exactly one/i);
  assert.match(instruction, /not the source/i);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd translator-api && npm test`
Expected: FAIL — `Cannot find module ... lib/prompt.js`.

- [ ] **Step 3: Write the implementation**

Create `translator-api/lib/prompt.js`:

```js
const DEFAULT_INSTRUCTION =
  "Expert Translator. Detect source language (English name). Translate by Formality(0-100) & Objective per target.";

const TWO_WAY_INSTRUCTION =
  "Expert Translator. Detect source language (English name). `targets` lists exactly two candidate languages. " +
  "Translate the text into the one that is not the source language, and return exactly one entry in `translations`. " +
  "Apply that target's Formality(0-100) & Objective.";

export const buildSystemInstruction = (twoWay) => (twoWay ? TWO_WAY_INSTRUCTION : DEFAULT_INSTRUCTION);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd translator-api && npm test`
Expected: PASS — the Task 2 tests and both new tests pass.

- [ ] **Step 5: Wire the flag into the handler**

In `translator-api/api/translate.js`, add the import below the existing ones at the top:

```js
import { buildSystemInstruction } from "../lib/prompt.js";
```

Change the request destructuring (currently line 31):

```js
  const { sourceText, targets, uid, twoWay } = req.body;
```

Change the model construction (currently lines 85-88):

```js
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      systemInstruction: buildSystemInstruction(twoWay)
    });
```

Nothing else changes — the response schema and quota metering are untouched.

- [ ] **Step 6: Verify both paths against the deployed backend**

```bash
curl -s -X POST https://translator-api-iota.vercel.app/api/translate \
  -H 'Content-Type: application/json' \
  -d '{"uid":"<REAL_FIREBASE_UID>","sourceText":"สวัสดีครับ","targets":[{"lang":"English","objective":"general","formality":50},{"lang":"Thai","objective":"general","formality":50}],"twoWay":true}'
```

Expected: `detected` is `"Thai"` and `translations` has exactly one entry with `lang: "English"`.

Then confirm the existing path still behaves:

```bash
curl -s -X POST https://translator-api-iota.vercel.app/api/translate \
  -H 'Content-Type: application/json' \
  -d '{"uid":"<REAL_FIREBASE_UID>","sourceText":"Hello","targets":[{"lang":"Thai","objective":"general","formality":50}]}'
```

Expected: one Thai translation, same as before this task.

- [ ] **Step 7: Commit**

```bash
git add translator-api/lib/prompt.js translator-api/lib/prompt.test.js translator-api/api/translate.js
git commit -m "feat(api): add twoWay flag so translate picks the non-source target"
```

---

### Task 6: Shared BCP-47 language codes

`speechService.js` already holds the display-name → BCP-47 map. The Web Speech engine needs the same map, so it moves to a shared module rather than being copied.

**Files:**
- Create: `src/services/live/languageCodes.js`
- Create: `src/services/live/languageCodes.test.js`
- Modify: `src/services/speechService.js:11-34` and `:58`

**Interfaces:**
- Produces: `LANGUAGE_CODES: Record<string, string>`, `toBcp47(label: string): string` (falls back to `'en-US'`)

- [ ] **Step 1: Write the failing test**

Create `src/services/live/languageCodes.test.js`:

```js
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/languageCodes.test.js`
Expected: FAIL — "Cannot find module './languageCodes'".

- [ ] **Step 3: Create the module**

Create `src/services/live/languageCodes.js` with the map moved verbatim out of `speechService.js`:

```js
// Display-name (as used in availableLanguages) -> BCP-47 code.
// Shared by TTS output and Web Speech recognition input.
export const LANGUAGE_CODES = {
  'English': 'en-US',
  'Japanese': 'ja-JP',
  'Korean': 'ko-KR',
  'Chinese (Simplified)': 'zh-CN',
  'Chinese (Traditional)': 'zh-TW',
  'Thai': 'th-TH',
  'Vietnamese': 'vi-VN',
  'Indonesian': 'id-ID',
  'Spanish': 'es-ES',
  'French': 'fr-FR',
  'German': 'de-DE',
  'Russian': 'ru-RU',
  'Portuguese': 'pt-PT',
  'Italian': 'it-IT',
  'Arabic': 'ar-SA',
  'Hindi': 'hi-IN',
  'Thai Gen Z slang': 'th-TH',
  'Ancient Royal Thai (Ayutthaya era)': 'th-TH',
  'Thai mystical and astrologer style': 'th-TH',
  'Isan (Northeastern Thai dialect)': 'th-TH',
  'Northern Thai dialect': 'th-TH',
  'Southern Thai dialect': 'th-TH',
};

export const toBcp47 = (label) => LANGUAGE_CODES[label] || 'en-US';
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/languageCodes.test.js`
Expected: PASS — 4 tests.

- [ ] **Step 5: Point speechService at the shared module**

In `src/services/speechService.js`, delete the whole local `languageMap` object (lines 11-34) and add to the imports at the top:

```js
import { toBcp47 } from './live/languageCodes';
```

Then replace the lookup (line 58):

```js
  utterance.lang = toBcp47(languageLabel);
```

Delete the now-unused `const languageCode = ...` line. While in this file, also delete the stray top-level `window.speechSynthesis.getVoices().forEach(...)` debug logging block at lines 68-70 — it runs on import, spams the console, and has no callers.

- [ ] **Step 6: Verify nothing regressed**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS.

Run: `CI=true npx react-scripts build`
Expected: "Compiled successfully".

- [ ] **Step 7: Commit**

```bash
git add src/services/live/languageCodes.js src/services/live/languageCodes.test.js src/services/speechService.js
git commit -m "refactor: extract shared BCP-47 language code map"
```

---

### Task 7: PCM audio helpers

Gemini wants raw 16-bit PCM at 16 kHz. The mic gives Float32 samples at whatever rate the audio hardware runs. These three pure functions bridge that gap and are the easiest part of the audio path to get subtly wrong, so they get real tests.

**Files:**
- Create: `src/services/live/pcm.js`
- Create: `src/services/live/pcm.test.js`

**Interfaces:**
- Produces:
  - `downsampleTo16k(input: Float32Array, inputSampleRate: number): Float32Array`
  - `floatTo16BitPCM(samples: Float32Array): ArrayBuffer` — Int16, little-endian
  - `toBase64(buffer: ArrayBuffer): string`
  - `TARGET_SAMPLE_RATE: 16000`

- [ ] **Step 1: Write the failing tests**

Create `src/services/live/pcm.test.js`:

```js
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
  expect(Array.from(out)).toEqual([0.1, -0.2, 0.3]);
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/pcm.test.js`
Expected: FAIL — "Cannot find module './pcm'".

- [ ] **Step 3: Write the implementation**

Create `src/services/live/pcm.js`:

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/pcm.test.js`
Expected: PASS — 7 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/live/pcm.js src/services/live/pcm.test.js
git commit -m "feat(live): add PCM16 16kHz audio conversion helpers"
```

---

### Task 8: Two-way direction helper

**Files:**
- Create: `src/services/live/direction.js`
- Create: `src/services/live/direction.test.js`

**Interfaces:**
- Produces: `pickTarget({ detected, langA, langB }): string` — returns the language that is *not* the detected one, defaulting to `langB`.
- Produces: `buildTargets({ twoWay, langA, langB, objective, formality }): Array<{ lang, objective, formality }>`

- [ ] **Step 1: Write the failing tests**

Create `src/services/live/direction.test.js`:

```js
import { pickTarget, buildTargets } from './direction';

test('detected source picks the other language', () => {
  expect(pickTarget({ detected: 'Thai', langA: 'Thai', langB: 'English' })).toBe('English');
  expect(pickTarget({ detected: 'English', langA: 'Thai', langB: 'English' })).toBe('Thai');
});

test('comparison ignores case and surrounding space', () => {
  expect(pickTarget({ detected: '  thai ', langA: 'Thai', langB: 'English' })).toBe('English');
});

test('unknown or missing detection falls back to langB', () => {
  expect(pickTarget({ detected: 'Auto', langA: 'Thai', langB: 'English' })).toBe('English');
  expect(pickTarget({ detected: undefined, langA: 'Thai', langB: 'English' })).toBe('English');
});

test('one-way builds a single target', () => {
  expect(buildTargets({ twoWay: false, langA: 'English', langB: 'Thai', objective: 'general', formality: 50 }))
    .toEqual([{ lang: 'Thai', objective: 'general', formality: 50 }]);
});

test('two-way builds both candidates for the backend to choose from', () => {
  expect(buildTargets({ twoWay: true, langA: 'English', langB: 'Thai', objective: 'social', formality: 20 }))
    .toEqual([
      { lang: 'English', objective: 'social', formality: 20 },
      { lang: 'Thai', objective: 'social', formality: 20 },
    ]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/direction.test.js`
Expected: FAIL — "Cannot find module './direction'".

- [ ] **Step 3: Write the implementation**

Create `src/services/live/direction.js`:

```js
const normalize = (value) => String(value || '').trim().toLowerCase();

/**
 * Given the language the backend detected, return the one of the two configured
 * languages the user did NOT speak. Used to label two-way results client-side.
 */
export const pickTarget = ({ detected, langA, langB }) =>
  normalize(detected) === normalize(langB) ? langA : langB;

/**
 * One-way sends a single target. Two-way sends both, and the backend's `twoWay`
 * flag makes the model return only the non-source one.
 */
export const buildTargets = ({ twoWay, langA, langB, objective, formality }) => {
  const target = (lang) => ({ lang, objective, formality });
  return twoWay ? [target(langA), target(langB)] : [target(langB)];
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/direction.test.js`
Expected: PASS — 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/live/direction.js src/services/live/direction.test.js
git commit -m "feat(live): add two-way translation direction helpers"
```

---

### Task 9: Live API client

**Files:**
- Create: `src/context/apiBase.js`
- Create: `src/context/LiveApi.js`
- Create: `src/context/LiveApi.test.js`
- Modify: `src/context/ControllerApi.js:2`

**Interfaces:**
- Produces: `API_ROOT: string`, `TRANSLATE_URL: string` from `apiBase.js`
- Produces: `requestLiveToken(uid): Promise<{ token, expiresAt, remainingSeconds }>`
- Produces: `reportLiveUsage(uid, seconds): Promise<{ billedSeconds, liveSecondsToday, liveSecondsLimit }>`
- Both reject with an `Error` carrying `.status` and `.data`, matching how `translateTextAPI` already reports failures so callers can keep using `err.status === 429`.

- [ ] **Step 1: Write the failing tests**

Create `src/context/LiveApi.test.js`:

```js
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/context/LiveApi.test.js`
Expected: FAIL — "Cannot find module './LiveApi'".

- [ ] **Step 3: Extract the shared API root**

Create `src/context/apiBase.js`:

```js
export const TRANSLATE_URL =
  process.env.REACT_APP_TRANSLATION_API_URL || 'https://translator-api-iota.vercel.app/api/translate';

// Every endpoint lives beside /translate on the same deployment.
export const API_ROOT = TRANSLATE_URL.replace(/\/translate\/?$/, '');
```

In `src/context/ControllerApi.js`, replace the local constant (line 2) with:

```js
import { TRANSLATE_URL } from './apiBase';
```

and change the `fetch(API_BASE_URL, ...)` call to `fetch(TRANSLATE_URL, ...)`.

- [ ] **Step 4: Write the implementation**

Create `src/context/LiveApi.js`:

```js
import { API_ROOT } from './apiBase';

const postJson = async (path, body) => {
  const response = await fetch(`${API_ROOT}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `API error: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const requestLiveToken = (uid) => postJson('/live-token', { uid });

export const reportLiveUsage = async (uid, seconds) => {
  const rounded = Math.ceil(Number(seconds) || 0);
  if (rounded <= 0) return { billedSeconds: 0 };
  return postJson('/live-usage', { uid, seconds: rounded });
};
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/context/LiveApi.test.js`
Expected: PASS — 4 tests.

- [ ] **Step 6: Verify the existing translate path still works**

Run: `CI=true npx react-scripts build`
Expected: "Compiled successfully".

- [ ] **Step 7: Commit**

```bash
git add src/context/apiBase.js src/context/LiveApi.js src/context/LiveApi.test.js src/context/ControllerApi.js
git commit -m "feat(live): add live token and usage API client"
```

---

### Task 10: Web Speech engine

**Files:**
- Create: `src/services/live/webSpeechEngine.js`
- Create: `src/services/live/webSpeechEngine.test.js`

**Interfaces:**
- Consumes: `toBcp47` from Task 6.
- Produces:
  - `isWebSpeechSupported(): boolean`
  - `createWebSpeechSession({ lang, onPartial, onFinal, onError }): { start(): Promise<void>, stop(): void }`
- `onFinal` receives `{ text }`. `onPartial` receives a string.

- [ ] **Step 1: Write the failing tests**

Create `src/services/live/webSpeechEngine.test.js`:

```js
import { createWebSpeechSession, isWebSpeechSupported } from './webSpeechEngine';

class MockRecognition {
  constructor() {
    this.started = 0;
    this.stopped = 0;
    MockRecognition.last = this;
  }
  start() { this.started += 1; }
  stop() { this.stopped += 1; }
  abort() { this.stopped += 1; }
}

const resultEvent = (entries) => ({
  resultIndex: 0,
  results: entries.map(([transcript, isFinal]) => {
    const alternatives = [{ transcript }];
    alternatives.isFinal = isFinal;
    return Object.assign(alternatives, { isFinal, 0: { transcript }, length: 1 });
  }),
});

beforeEach(() => {
  window.webkitSpeechRecognition = MockRecognition;
});

afterEach(() => {
  delete window.webkitSpeechRecognition;
  delete window.SpeechRecognition;
});

test('reports support based on the browser global', () => {
  expect(isWebSpeechSupported()).toBe(true);
  delete window.webkitSpeechRecognition;
  expect(isWebSpeechSupported()).toBe(false);
});

test('start configures continuous recognition in the requested language', async () => {
  const session = createWebSpeechSession({ lang: 'Thai', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  const recognition = MockRecognition.last;
  expect(recognition.lang).toBe('th-TH');
  expect(recognition.continuous).toBe(true);
  expect(recognition.interimResults).toBe(true);
  expect(recognition.started).toBe(1);
});

test('interim results go to onPartial, final results to onFinal', async () => {
  const onPartial = jest.fn();
  const onFinal = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial, onFinal, onError: jest.fn() });
  await session.start();

  MockRecognition.last.onresult(resultEvent([['hello wor', false]]));
  expect(onPartial).toHaveBeenCalledWith('hello wor');
  expect(onFinal).not.toHaveBeenCalled();

  MockRecognition.last.onresult(resultEvent([['hello world', true]]));
  expect(onFinal).toHaveBeenCalledWith({ text: 'hello world' });
});

test('blank final results are ignored', async () => {
  const onFinal = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal, onError: jest.fn() });
  await session.start();

  MockRecognition.last.onresult(resultEvent([['   ', true]]));
  expect(onFinal).not.toHaveBeenCalled();
});

test('recognition restarts itself while the session is active', async () => {
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(2);
});

test('recognition does not restart after stop', async () => {
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();
  session.stop();

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(1);
});

test('permission errors reach onError and stop the session', async () => {
  const onError = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  MockRecognition.last.onerror({ error: 'not-allowed' });
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ code: 'not-allowed' }));

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(1);
});

test('no-speech errors are ignored so the session keeps listening', async () => {
  const onError = jest.fn();
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  MockRecognition.last.onerror({ error: 'no-speech' });
  expect(onError).not.toHaveBeenCalled();

  MockRecognition.last.onend();
  expect(MockRecognition.last.started).toBe(2);
});

test('start throws when the browser has no support', async () => {
  delete window.webkitSpeechRecognition;
  const session = createWebSpeechSession({ lang: 'English', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });

  await expect(session.start()).rejects.toThrow(/not supported/i);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/webSpeechEngine.test.js`
Expected: FAIL — "Cannot find module './webSpeechEngine'".

- [ ] **Step 3: Write the implementation**

Create `src/services/live/webSpeechEngine.js`:

```js
import { toBcp47 } from './languageCodes';

// Chrome ends recognition on its own after a pause even in continuous mode,
// so `no-speech` is normal operation, not a failure worth surfacing.
const IGNORED_ERRORS = ['no-speech', 'aborted'];

const getRecognitionCtor = () => window.SpeechRecognition || window.webkitSpeechRecognition;

export const isWebSpeechSupported = () => Boolean(getRecognitionCtor());

export const createWebSpeechSession = ({ lang, onPartial, onFinal, onError }) => {
  let recognition = null;
  let active = false;

  const start = async () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) throw new Error('Web Speech recognition is not supported in this browser');

    recognition = new Ctor();
    recognition.lang = toBcp47(lang);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          const text = transcript.trim();
          if (text) onFinal({ text });
        } else {
          interim += transcript;
        }
      }
      if (interim) onPartial(interim);
    };

    recognition.onerror = (event) => {
      if (IGNORED_ERRORS.includes(event.error)) return;
      active = false;
      onError(Object.assign(new Error(`Speech recognition failed: ${event.error}`), { code: event.error }));
    };

    recognition.onend = () => {
      if (!active) return;
      try {
        recognition.start();
      } catch (err) {
        active = false;
        onError(err);
      }
    };

    active = true;
    recognition.start();
  };

  const stop = () => {
    active = false;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // Already stopped — nothing to unwind.
    }
  };

  return { start, stop };
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/webSpeechEngine.test.js`
Expected: PASS — 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/live/webSpeechEngine.js src/services/live/webSpeechEngine.test.js
git commit -m "feat(live): add Web Speech recognition engine"
```

---

### Task 11: Gemini live transcription engine

**Files:**
- Create: `src/services/live/geminiLiveEngine.js`
- Create: `src/services/live/geminiLiveEngine.test.js`

**Interfaces:**
- Consumes: `downsampleTo16k`, `floatTo16BitPCM`, `toBase64` from Task 7.
- Produces:
  - `LIVE_MODEL: 'gemini-3.5-transcribe-live'`
  - `isGeminiLiveSupported(): boolean` — needs `navigator.mediaDevices.getUserMedia` and `window.AudioContext`
  - `createGeminiLiveSession({ token, onPartial, onFinal, onError }): { start(): Promise<void>, stop(): Promise<void> }`

`onFinal` receives `{ text }`, matching Task 10, so `LiveWorkspace` never branches on engine.

- [ ] **Step 1: Write the failing tests**

Create `src/services/live/geminiLiveEngine.test.js`:

```js
import { createGeminiLiveSession, isGeminiLiveSupported, LIVE_MODEL } from './geminiLiveEngine';

const mockSession = { sendRealtimeInput: jest.fn(), close: jest.fn() };
const mockConnect = jest.fn();

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    live: { connect: (...args) => mockConnect(...args) },
  })),
  Modality: { TEXT: 'TEXT' },
}));

let capturedCallbacks;
let mockTrack;

beforeEach(() => {
  mockConnect.mockImplementation(async ({ callbacks }) => {
    capturedCallbacks = callbacks;
    return mockSession;
  });

  mockTrack = { stop: jest.fn() };
  navigator.mediaDevices = {
    getUserMedia: jest.fn().mockResolvedValue({ getTracks: () => [mockTrack] }),
  };

  window.AudioContext = jest.fn().mockImplementation(() => ({
    sampleRate: 48000,
    createMediaStreamSource: () => ({ connect: jest.fn(), disconnect: jest.fn() }),
    createScriptProcessor: () => ({ connect: jest.fn(), disconnect: jest.fn() }),
    destination: {},
    close: jest.fn().mockResolvedValue(undefined),
  }));
});

afterEach(() => {
  jest.clearAllMocks();
  delete window.AudioContext;
});

test('exposes the transcription-only model id', () => {
  expect(LIVE_MODEL).toBe('gemini-3.5-transcribe-live');
});

test('support check requires getUserMedia and AudioContext', () => {
  expect(isGeminiLiveSupported()).toBe(true);
  delete window.AudioContext;
  expect(isGeminiLiveSupported()).toBe(false);
});

test('connects with transcription-only config and auto language detection', async () => {
  const session = createGeminiLiveSession({ token: 'auth_tokens/x', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  const config = mockConnect.mock.calls[0][0];
  expect(config.model).toBe('gemini-3.5-transcribe-live');
  expect(config.config.responseModalities).toEqual(['TEXT']);
  expect(config.config.inputAudioTranscription.languageCodes).toEqual([]);
});

test('requests mono mic audio', async () => {
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith(
    expect.objectContaining({ audio: expect.objectContaining({ channelCount: 1 }) })
  );
});

test('interim transcription reaches onPartial', async () => {
  const onPartial = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial, onFinal: jest.fn(), onError: jest.fn() });
  await session.start();

  capturedCallbacks.onmessage({ serverContent: { interimInputTranscription: { text: 'สวัส' } } });
  expect(onPartial).toHaveBeenCalledWith('สวัส');
});

test('final transcription reaches onFinal', async () => {
  const onFinal = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal, onError: jest.fn() });
  await session.start();

  capturedCallbacks.onmessage({ serverContent: { inputTranscription: { text: 'สวัสดีครับ' } } });
  expect(onFinal).toHaveBeenCalledWith({ text: 'สวัสดีครับ' });
});

test('empty transcription text is ignored', async () => {
  const onFinal = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal, onError: jest.fn() });
  await session.start();

  capturedCallbacks.onmessage({ serverContent: { inputTranscription: { text: '  ' } } });
  expect(onFinal).not.toHaveBeenCalled();
});

test('socket errors reach onError', async () => {
  const onError = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  capturedCallbacks.onerror(new Error('socket died'));
  expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'socket died' }));
});

test('an unexpected close reaches onError, a requested one does not', async () => {
  const onError = jest.fn();
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError });
  await session.start();

  capturedCallbacks.onclose({ reason: 'server hung up' });
  expect(onError).toHaveBeenCalledTimes(1);

  onError.mockClear();
  await session.stop();
  capturedCallbacks.onclose({ reason: 'client closed' });
  expect(onError).not.toHaveBeenCalled();
});

test('stop releases the mic and closes the session', async () => {
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });
  await session.start();
  await session.stop();

  expect(mockTrack.stop).toHaveBeenCalled();
  expect(mockSession.close).toHaveBeenCalled();
});

test('a denied mic permission rejects start', async () => {
  navigator.mediaDevices.getUserMedia.mockRejectedValue(
    Object.assign(new Error('Permission denied'), { name: 'NotAllowedError' })
  );
  const session = createGeminiLiveSession({ token: 't', onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() });

  await expect(session.start()).rejects.toMatchObject({ name: 'NotAllowedError' });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/geminiLiveEngine.test.js`
Expected: FAIL — "Cannot find module './geminiLiveEngine'".

- [ ] **Step 3: Write the implementation**

Create `src/services/live/geminiLiveEngine.js`. `ScriptProcessorNode` is deprecated but is the only mic-tap that works without shipping a separate worklet file through CRA's build, and at a 4096-sample buffer on a 48 kHz mic it fires roughly every 85 ms — close enough to the 100 ms chunk size Google asks for.

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/geminiLiveEngine.test.js`
Expected: PASS — 11 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/live/geminiLiveEngine.js src/services/live/geminiLiveEngine.test.js
git commit -m "feat(live): add Gemini live transcription engine"
```

---

### Task 12: Engine facade

One entry point so `LiveWorkspace` never imports an engine directly, and one place that decides which engine a given browser can actually run.

**Files:**
- Create: `src/services/live/index.js`
- Create: `src/services/live/index.test.js`

**Interfaces:**
- Consumes: both engines and their support checks from Tasks 10 and 11.
- Produces:
  - `ENGINES = { GEMINI: 'gemini', WEB_SPEECH: 'webSpeech' }`
  - `resolveEngine({ preferGemini, hasToken }): 'gemini' | 'webSpeech' | null`
  - `createLiveSession({ engine, lang, token, onPartial, onFinal, onError }): { start, stop }`

- [ ] **Step 1: Write the failing tests**

Create `src/services/live/index.test.js`:

```js
import { ENGINES, resolveEngine, createLiveSession } from './index';
import { createWebSpeechSession, isWebSpeechSupported } from './webSpeechEngine';
import { createGeminiLiveSession, isGeminiLiveSupported } from './geminiLiveEngine';

jest.mock('./webSpeechEngine', () => ({
  isWebSpeechSupported: jest.fn(),
  createWebSpeechSession: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
}));

jest.mock('./geminiLiveEngine', () => ({
  isGeminiLiveSupported: jest.fn(),
  createGeminiLiveSession: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
}));

afterEach(() => jest.clearAllMocks());

test('prefers Gemini when it is supported and a token is in hand', () => {
  isGeminiLiveSupported.mockReturnValue(true);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: true, hasToken: true })).toBe(ENGINES.GEMINI);
});

test('falls back to Web Speech without a token', () => {
  isGeminiLiveSupported.mockReturnValue(true);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: true, hasToken: false })).toBe(ENGINES.WEB_SPEECH);
});

test('honours the user turning high quality mode off', () => {
  isGeminiLiveSupported.mockReturnValue(true);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: false, hasToken: true })).toBe(ENGINES.WEB_SPEECH);
});

test('falls back when the browser cannot capture audio', () => {
  isGeminiLiveSupported.mockReturnValue(false);
  isWebSpeechSupported.mockReturnValue(true);
  expect(resolveEngine({ preferGemini: true, hasToken: true })).toBe(ENGINES.WEB_SPEECH);
});

test('returns null when no engine is available at all', () => {
  isGeminiLiveSupported.mockReturnValue(false);
  isWebSpeechSupported.mockReturnValue(false);
  expect(resolveEngine({ preferGemini: true, hasToken: true })).toBeNull();
});

test('createLiveSession routes to the Gemini engine with the token', () => {
  const handlers = { onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() };
  createLiveSession({ engine: ENGINES.GEMINI, lang: 'Thai', token: 'tok', ...handlers });

  expect(createGeminiLiveSession).toHaveBeenCalledWith(expect.objectContaining({ token: 'tok' }));
  expect(createWebSpeechSession).not.toHaveBeenCalled();
});

test('createLiveSession routes to Web Speech with the language', () => {
  const handlers = { onPartial: jest.fn(), onFinal: jest.fn(), onError: jest.fn() };
  createLiveSession({ engine: ENGINES.WEB_SPEECH, lang: 'Thai', token: null, ...handlers });

  expect(createWebSpeechSession).toHaveBeenCalledWith(expect.objectContaining({ lang: 'Thai' }));
  expect(createGeminiLiveSession).not.toHaveBeenCalled();
});

test('createLiveSession rejects an unknown engine', () => {
  expect(() => createLiveSession({ engine: 'telepathy' })).toThrow(/unknown engine/i);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/index.test.js`
Expected: FAIL — "Cannot find module './index'".

- [ ] **Step 3: Write the implementation**

Create `src/services/live/index.js`:

```js
import { createWebSpeechSession, isWebSpeechSupported } from './webSpeechEngine';
import { createGeminiLiveSession, isGeminiLiveSupported } from './geminiLiveEngine';

export const ENGINES = { GEMINI: 'gemini', WEB_SPEECH: 'webSpeech' };

/**
 * Decide which engine can actually run right now. Returns null when the browser
 * supports neither, which the UI turns into the "unsupported browser" banner.
 */
export const resolveEngine = ({ preferGemini, hasToken }) => {
  if (preferGemini && hasToken && isGeminiLiveSupported()) return ENGINES.GEMINI;
  if (isWebSpeechSupported()) return ENGINES.WEB_SPEECH;
  return null;
};

export const createLiveSession = ({ engine, lang, token, onPartial, onFinal, onError }) => {
  if (engine === ENGINES.GEMINI) {
    return createGeminiLiveSession({ token, onPartial, onFinal, onError });
  }
  if (engine === ENGINES.WEB_SPEECH) {
    return createWebSpeechSession({ lang, onPartial, onFinal, onError });
  }
  throw new Error(`Unknown engine: ${engine}`);
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/services/live/index.test.js`
Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/services/live/index.js src/services/live/index.test.js
git commit -m "feat(live): add engine facade with support-based fallback"
```

---

### Task 13: Live seconds in useQuota

**Files:**
- Modify: `src/hooks/useQuota.js:43-58`
- Create: `src/hooks/useQuota.test.js`

**Interfaces:**
- Produces: `useQuota()` additionally returns `liveSecondsUsed`, `liveSecondsLimit`, `livePercentage`, `isLiveOverLimit`. Existing return values are unchanged.

- [ ] **Step 1: Write the failing test**

Create `src/hooks/useQuota.test.js`:

```js
import { renderHook } from '@testing-library/react';
import useQuota from './useQuota';

let authCallback;
let snapshotCallback;

jest.mock('../configuration/firebase', () => ({ db: {}, auth: {} }));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: (_auth, cb) => {
    authCallback = cb;
    return jest.fn();
  },
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  onSnapshot: (_ref, cb) => {
    snapshotCallback = cb;
    return jest.fn();
  },
}));

const emit = (data) => {
  authCallback({ uid: 'user-1' });
  snapshotCallback({ exists: () => true, data: () => data });
};

test('exposes live seconds alongside token usage', () => {
  const { result, rerender } = renderHook(() => useQuota());
  emit({ tokens_today: 200, daily_limit: 10000, live_seconds_today: 150, live_seconds_limit: 600 });
  rerender();

  expect(result.current.used).toBe(200);
  expect(result.current.liveSecondsUsed).toBe(150);
  expect(result.current.liveSecondsLimit).toBe(600);
  expect(result.current.livePercentage).toBe(25);
  expect(result.current.isLiveOverLimit).toBe(false);
});

test('defaults live fields for a document written before this feature', () => {
  const { result, rerender } = renderHook(() => useQuota());
  emit({ tokens_today: 0, daily_limit: 10000 });
  rerender();

  expect(result.current.liveSecondsUsed).toBe(0);
  expect(result.current.liveSecondsLimit).toBe(600);
});

test('flags an exhausted live bucket', () => {
  const { result, rerender } = renderHook(() => useQuota());
  emit({ live_seconds_today: 600, live_seconds_limit: 600 });
  rerender();

  expect(result.current.isLiveOverLimit).toBe(true);
  expect(result.current.livePercentage).toBe(100);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/hooks/useQuota.test.js`
Expected: FAIL — `liveSecondsUsed` is `undefined`.

- [ ] **Step 3: Extend the hook**

In `src/hooks/useQuota.js`, replace the derived-values block and return (lines 43-58) with:

```js
    const used = quota?.tokens_today || 0;
    const limit = quota?.daily_limit || 10000;
    const percentage = Math.min((used / limit) * 100, 100);
    const isNearLimit = percentage >= 90;
    const isOverLimit = used >= limit;

    const liveSecondsUsed = quota?.live_seconds_today || 0;
    const liveSecondsLimit = quota?.live_seconds_limit || 600;
    const livePercentage = Math.min((liveSecondsUsed / liveSecondsLimit) * 100, 100);
    const isLiveOverLimit = liveSecondsUsed >= liveSecondsLimit;

    return {
        quota,
        loading,
        used,
        limit,
        percentage,
        isNearLimit,
        isOverLimit,
        liveSecondsUsed,
        liveSecondsLimit,
        livePercentage,
        isLiveOverLimit,
        uid
    };
```

Also update the default in the `onSnapshot` handler (line 32) so a missing document carries the live fields:

```js
                setQuota({ tokens_today: 0, daily_limit: 10000, live_seconds_today: 0, live_seconds_limit: 600 });
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/hooks/useQuota.test.js`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useQuota.js src/hooks/useQuota.test.js
git commit -m "feat(quota): expose live audio seconds from useQuota"
```

---

### Task 14: Route, nav entry, and copy

An empty `/live` page that routes and renders, so the UI tasks that follow have somewhere to land.

**Files:**
- Create: `src/i18n/zones/live.js`
- Create: `src/page/LivePage.jsx`
- Create: `src/page/LivePage.test.js`
- Modify: `src/i18n/translations.js:6-16`
- Modify: `src/i18n/zones/nav.js` (`nav` object)
- Modify: `src/configuration/navItems.js`
- Modify: `src/App.js:19` and `:55-60`

**Interfaces:**
- Produces: route `/live` inside `MainLayout`, nav item keyed `nav.live`, and the `live.*` i18n namespace every later component uses.

- [ ] **Step 1: Write the failing test**

Create `src/page/LivePage.test.js`:

```js
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LivePage from './LivePage';
import { LanguageProvider } from '../context/LanguageContext';

jest.mock('../components/Main/Live/LiveWorkspace', () => () => <div data-testid="live-workspace" />);

test('renders the live workspace', () => {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <LivePage />
      </LanguageProvider>
    </MemoryRouter>
  );

  expect(screen.getByTestId('live-workspace')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `CI=true npx react-scripts test --watchAll=false src/page/LivePage.test.js`
Expected: FAIL — "Cannot find module './LivePage'".

- [ ] **Step 3: Add the i18n zone**

Create `src/i18n/zones/live.js`:

```js
const live = {
    en: {
        live: {
            heading: 'What would you like to do today?',
            tabs: { transcribe: 'Transcribe', translate: 'Translate', dubbing: 'Dubbing' },
            comingSoon: 'Coming soon',
            swap: 'Swap languages',
            twoWay: 'Two-way translation',
            twoWayInfo: 'Both speakers share one mic. Each sentence is translated into the other language automatically.',
            twoWayWebSpeechInfo: 'Browser mode cannot detect the language on its own — tap the button for the side that is speaking.',
            highQuality: 'High quality mode',
            highQualityInfo: 'Uses Gemini live transcription. More accurate and works in every browser, but consumes your daily live minutes.',
            autoSpeak: 'Read translation aloud',
            press: 'Press and start talking',
            listening: 'Listening…',
            stop: 'Stop',
            speaker: 'Speaker {n}',
            empty: 'Your conversation will appear here.',
            minutesLeft: '{seconds}s of live audio left today',
            translating: 'Translating…',
            retry: 'Retry',
            errors: {
                micDenied: 'Microphone access was denied. Allow it in your browser settings and try again.',
                noEngine: 'Real-time speech is not supported in this browser. Please use Chrome or Edge.',
                fellBackToBrowser: 'High quality mode is unavailable, switched to browser speech recognition.',
                translateFailed: 'Could not translate this sentence.',
                sessionFailed: 'The live session stopped unexpectedly.',
            },
        },
    },
    th: {
        live: {
            heading: 'วันนี้อยากทำอะไรดี?',
            tabs: { transcribe: 'ถอดข้อความ', translate: 'แปลภาษา', dubbing: 'พากย์เสียง' },
            comingSoon: 'เร็ว ๆ นี้',
            swap: 'สลับภาษา',
            twoWay: 'แปลสองทาง',
            twoWayInfo: 'ใช้ไมค์ตัวเดียวร่วมกัน ระบบจะแปลแต่ละประโยคไปเป็นอีกภาษาให้อัตโนมัติ',
            twoWayWebSpeechInfo: 'โหมดเบราว์เซอร์ตรวจภาษาเองไม่ได้ — กดปุ่มฝั่งที่กำลังพูด',
            highQuality: 'โหมดคุณภาพสูง',
            highQualityInfo: 'ใช้ Gemini ถอดเสียงแบบเรียลไทม์ แม่นกว่าและใช้ได้ทุกเบราว์เซอร์ แต่จะกินโควตานาทีต่อวัน',
            autoSpeak: 'อ่านคำแปลออกเสียง',
            press: 'กดแล้วเริ่มพูดได้เลย',
            listening: 'กำลังฟัง…',
            stop: 'หยุด',
            speaker: 'คนที่ {n}',
            empty: 'บทสนทนาจะแสดงที่นี่',
            minutesLeft: 'เหลือเวลาพูดวันนี้ {seconds} วินาที',
            translating: 'กำลังแปล…',
            retry: 'ลองใหม่',
            errors: {
                micDenied: 'ไม่ได้รับสิทธิ์ใช้ไมโครโฟน กรุณาอนุญาตในตั้งค่าเบราว์เซอร์แล้วลองใหม่',
                noEngine: 'เบราว์เซอร์นี้ไม่รองรับการพูดแบบเรียลไทม์ กรุณาใช้ Chrome หรือ Edge',
                fellBackToBrowser: 'ใช้โหมดคุณภาพสูงไม่ได้ สลับไปใช้การรู้จำเสียงของเบราว์เซอร์แทน',
                translateFailed: 'แปลประโยคนี้ไม่สำเร็จ',
                sessionFailed: 'เซสชันถอดเสียงหยุดกลางคัน',
            },
        },
    },
};

export default live;
```

- [ ] **Step 4: Register the zone**

In `src/i18n/translations.js`, add the import beside the others:

```js
import live from './zones/live';
```

and add `live` to the `ZONES` array:

```js
const ZONES = [common, nav, translator, notebook, history, saved, settings, auth, landing, live];
```

- [ ] **Step 5: Add the nav label**

In `src/i18n/zones/nav.js`, add `live: 'Live'` to the English `nav` object and `live: 'เรียลไทม์'` to the Thai one.

- [ ] **Step 6: Add the nav item**

In `src/configuration/navItems.js`, add `Radio` to the lucide import and insert the entry after Translate:

```js
    { name: 'Live', labelKey: 'nav.live', path: '/live', icon: <Radio className="w-[18px] h-[18px]" strokeWidth={2} /> },
```

- [ ] **Step 7: Create the page**

Create `src/page/LivePage.jsx`:

```jsx
import React from 'react'
import LiveWorkspace from '../components/Main/Live/LiveWorkspace'

const LivePage = () => (
  <div className="w-full flex-1 flex flex-col relative min-h-[calc(100vh-80px)]">
    <LiveWorkspace />
  </div>
)

export default LivePage
```

- [ ] **Step 8: Add a placeholder workspace so the page compiles**

Create `src/components/Main/Live/LiveWorkspace.js` — Task 16 replaces the body entirely:

```jsx
import React from 'react'

const LiveWorkspace = () => <div />

export default LiveWorkspace
```

- [ ] **Step 9: Add the route**

In `src/App.js`, add the import beside the other pages:

```js
import LivePage from './page/LivePage';
```

and add the route inside the authenticated `MainLayout` block, right after `/app`:

```jsx
            <Route path="/live" element={<LivePage />} />
```

- [ ] **Step 10: Run the test to verify it passes**

Run: `CI=true npx react-scripts test --watchAll=false src/page/LivePage.test.js`
Expected: PASS — 1 test.

- [ ] **Step 11: Verify the whole suite and the build**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS.

Run: `CI=true npx react-scripts build`
Expected: "Compiled successfully".

- [ ] **Step 12: Commit**

```bash
git add src/i18n/zones/live.js src/i18n/translations.js src/i18n/zones/nav.js src/configuration/navItems.js src/page/LivePage.jsx src/page/LivePage.test.js src/components/Main/Live/LiveWorkspace.js src/App.js
git commit -m "feat(live): add /live route, nav entry, and i18n copy"
```

---

### Task 15: Presentational components

Five stateless components. All state lives in `LiveWorkspace` (Task 16), so each of these is a pure function of its props and is trivially testable.

**Files:**
- Create: `src/components/Main/Live/ModeTabs.js`
- Create: `src/components/Main/Live/LanguagePairBar.js`
- Create: `src/components/Main/Live/TwoWayToggle.js`
- Create: `src/components/Main/Live/MicButton.js`
- Create: `src/components/Main/Live/TranscriptStream.js`
- Create: `src/components/Main/Live/components.test.js`

**Interfaces:**
- `ModeTabs({ mode, onChange })` — `mode` is `'transcribe' | 'translate' | 'dubbing'`; only `'translate'` is selectable.
- `LanguagePairBar({ langA, langB, onPickA, onPickB, onSwap, disabled })`
- `TwoWayToggle({ enabled, onChange, infoText, disabled })`
- `MicButton({ state, label, onClick, disabled })` — `state` is `'idle' | 'listening'`.
- `TranscriptStream({ utterances, interimText, onRetry, emptyLabel })` where an utterance is
  `{ id, sourceText, sourceLang, translatedText, targetLang, status }` and `status` is
  `'pending' | 'done' | 'failed'`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/Main/Live/components.test.js`:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../../../context/LanguageContext';
import ModeTabs from './ModeTabs';
import LanguagePairBar from './LanguagePairBar';
import TwoWayToggle from './TwoWayToggle';
import MicButton from './MicButton';
import TranscriptStream from './TranscriptStream';

const wrap = (ui) => render(<LanguageProvider>{ui}</LanguageProvider>);

test('ModeTabs disables everything except translate', () => {
  const onChange = jest.fn();
  wrap(<ModeTabs mode="translate" onChange={onChange} />);

  expect(screen.getByRole('button', { name: /translate/i })).toBeEnabled();
  expect(screen.getByRole('button', { name: /transcribe/i })).toBeDisabled();
  expect(screen.getByRole('button', { name: /dubbing/i })).toBeDisabled();

  fireEvent.click(screen.getByRole('button', { name: /transcribe/i }));
  expect(onChange).not.toHaveBeenCalled();
});

test('LanguagePairBar shows both languages and swaps them', () => {
  const onSwap = jest.fn();
  wrap(<LanguagePairBar langA="English" langB="Thai" onPickA={jest.fn()} onPickB={jest.fn()} onSwap={onSwap} disabled={false} />);

  expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Thai' })).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/swap/i));
  expect(onSwap).toHaveBeenCalled();
});

test('LanguagePairBar locks while a session is running', () => {
  wrap(<LanguagePairBar langA="English" langB="Thai" onPickA={jest.fn()} onPickB={jest.fn()} onSwap={jest.fn()} disabled />);
  expect(screen.getByRole('button', { name: 'English' })).toBeDisabled();
});

test('TwoWayToggle reports the flipped value', () => {
  const onChange = jest.fn();
  wrap(<TwoWayToggle enabled={false} onChange={onChange} infoText="info" disabled={false} />);

  fireEvent.click(screen.getByRole('switch'));
  expect(onChange).toHaveBeenCalledWith(true);
});

test('MicButton renders its label and fires on click', () => {
  const onClick = jest.fn();
  wrap(<MicButton state="idle" label="Press and start talking" onClick={onClick} disabled={false} />);

  expect(screen.getByText('Press and start talking')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});

test('MicButton exposes its listening state to assistive tech', () => {
  wrap(<MicButton state="listening" label="Listening…" onClick={jest.fn()} disabled={false} />);
  expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
});

test('TranscriptStream shows the empty state', () => {
  wrap(<TranscriptStream utterances={[]} interimText="" onRetry={jest.fn()} emptyLabel="Nothing yet" />);
  expect(screen.getByText('Nothing yet')).toBeInTheDocument();
});

test('TranscriptStream renders source and translation', () => {
  const utterances = [
    { id: '1', sourceText: 'สวัสดี', sourceLang: 'Thai', translatedText: 'Hello', targetLang: 'English', status: 'done' },
  ];
  wrap(<TranscriptStream utterances={utterances} interimText="" onRetry={jest.fn()} emptyLabel="Nothing yet" />);

  expect(screen.getByText('สวัสดี')).toBeInTheDocument();
  expect(screen.getByText('Hello')).toBeInTheDocument();
  expect(screen.queryByText('Nothing yet')).not.toBeInTheDocument();
});

test('TranscriptStream shows interim text separately from settled utterances', () => {
  wrap(<TranscriptStream utterances={[]} interimText="สวัส" onRetry={jest.fn()} emptyLabel="Nothing yet" />);
  expect(screen.getByTestId('interim-text')).toHaveTextContent('สวัส');
});

test('TranscriptStream offers a retry on a failed utterance', () => {
  const onRetry = jest.fn();
  const utterances = [
    { id: '7', sourceText: 'Hello', sourceLang: 'English', translatedText: '', targetLang: 'Thai', status: 'failed' },
  ];
  wrap(<TranscriptStream utterances={utterances} interimText="" onRetry={onRetry} emptyLabel="Nothing yet" />);

  fireEvent.click(screen.getByRole('button', { name: /retry|ลองใหม่/i }));
  expect(onRetry).toHaveBeenCalledWith('7');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/components/Main/Live/components.test.js`
Expected: FAIL — "Cannot find module './ModeTabs'".

- [ ] **Step 3: Write ModeTabs**

Create `src/components/Main/Live/ModeTabs.js`:

```jsx
import React from 'react';
import { AlignLeft, Languages, Users } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const MODES = [
  { key: 'transcribe', icon: AlignLeft, enabled: false },
  { key: 'translate', icon: Languages, enabled: true },
  { key: 'dubbing', icon: Users, enabled: false },
];

const ModeTabs = ({ mode, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 p-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
      {MODES.map(({ key, icon: Icon, enabled }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            type="button"
            disabled={!enabled}
            title={enabled ? undefined : t('live.comingSoon')}
            onClick={() => enabled && onChange(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              active
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            } ${enabled ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200' : 'opacity-40 cursor-not-allowed'}`}
          >
            <Icon size={16} strokeWidth={2} />
            {t(`live.tabs.${key}`)}
          </button>
        );
      })}
    </div>
  );
};

export default ModeTabs;
```

- [ ] **Step 4: Write LanguagePairBar**

Create `src/components/Main/Live/LanguagePairBar.js`:

```jsx
import React from 'react';
import { ChevronDown, ArrowLeftRight } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const LanguagePairBar = ({ langA, langB, onPickA, onPickB, onSwap, disabled }) => {
  const { t } = useTranslation();

  const pill = (lang, onPick) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onPick}
      className="flex-1 flex items-center justify-between gap-3 px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
    >
      {lang}
      <ChevronDown size={16} className="text-slate-400" />
    </button>
  );

  return (
    <div className="w-full flex items-center gap-3">
      {pill(langA, onPickA)}
      <button
        type="button"
        aria-label={t('live.swap')}
        disabled={disabled}
        onClick={onSwap}
        className="shrink-0 w-11 h-11 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed hover:text-teal-600 transition-colors"
      >
        <ArrowLeftRight size={16} />
      </button>
      {pill(langB, onPickB)}
    </div>
  );
};

export default LanguagePairBar;
```

- [ ] **Step 5: Write TwoWayToggle**

Create `src/components/Main/Live/TwoWayToggle.js`:

```jsx
import React from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const TwoWayToggle = ({ enabled, onChange, infoText, disabled }) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {t('live.twoWay')}
        <span title={infoText} className="text-slate-400 cursor-help">
          <Info size={14} />
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
};

export default TwoWayToggle;
```

- [ ] **Step 6: Write MicButton**

Create `src/components/Main/Live/MicButton.js`:

```jsx
import React from 'react';
import { Mic, Square } from 'lucide-react';

// `size` is 'lg' for the single shared mic and 'sm' for the paired per-speaker
// buttons used by two-way browser mode.
const MicButton = ({ state, label, onClick, disabled, size = 'lg' }) => {
  const listening = state === 'listening';
  const dimensions = size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const iconSize = size === 'lg' ? 32 : 22;

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm font-medium text-teal-600 dark:text-teal-400">
        {label}
      </span>
      <button
        type="button"
        aria-label={label}
        aria-pressed={listening}
        disabled={disabled}
        onClick={onClick}
        className={`${dimensions} rounded-full flex items-center justify-center text-white shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
          listening
            ? 'bg-rose-600 shadow-rose-500/40 animate-pulse'
            : 'bg-rose-500 shadow-rose-500/30 hover:scale-105 active:scale-95'
        }`}
      >
        {listening ? <Square size={iconSize - 4} fill="currentColor" /> : <Mic size={iconSize} />}
      </button>
    </div>
  );
};

export default MicButton;
```

- [ ] **Step 7: Write TranscriptStream**

Create `src/components/Main/Live/TranscriptStream.js`:

```jsx
import React from 'react';
import { RotateCw, Loader2 } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

const TranscriptStream = ({ utterances, interimText, onRetry, emptyLabel }) => {
  const { t } = useTranslation();
  const isEmpty = utterances.length === 0 && !interimText;

  if (isEmpty) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-y-auto flex flex-col gap-3 py-4">
      {utterances.map((utterance) => (
        <div
          key={utterance.id}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4"
        >
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">{utterance.sourceLang}</p>
          <p className="text-slate-700 dark:text-slate-200">{utterance.sourceText}</p>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs uppercase tracking-wide text-teal-500 mb-1">{utterance.targetLang}</p>

            {utterance.status === 'pending' && (
              <p className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                {t('live.translating')}
              </p>
            )}

            {utterance.status === 'done' && (
              <p className="text-slate-900 dark:text-white font-medium">{utterance.translatedText}</p>
            )}

            {utterance.status === 'failed' && (
              <div className="flex items-center gap-3">
                <p className="text-rose-500 text-sm">{t('live.errors.translateFailed')}</p>
                <button
                  type="button"
                  onClick={() => onRetry(utterance.id)}
                  className="flex items-center gap-1 text-sm text-teal-600 hover:underline"
                >
                  <RotateCw size={13} />
                  {t('live.retry')}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {interimText && (
        <div
          data-testid="interim-text"
          className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 px-5 py-4 text-slate-400 italic"
        >
          {interimText}
        </div>
      )}
    </div>
  );
};

export default TranscriptStream;
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/components/Main/Live/components.test.js`
Expected: PASS — 10 tests.

- [ ] **Step 9: Commit**

```bash
git add src/components/Main/Live/
git commit -m "feat(live): add presentational components for the live page"
```

---

### Task 16: LiveWorkspace orchestration

The one stateful piece: it owns the session lifecycle, turns finished utterances into translations, speaks them, meters usage, and writes history on stop.

**Files:**
- Modify: `src/components/Main/Live/LiveWorkspace.js` (replacing the Task 14 placeholder)
- Create: `src/components/Main/Live/LiveWorkspace.test.js`

**Interfaces:**
- Consumes: `createLiveSession` / `resolveEngine` / `ENGINES` (Task 12), `requestLiveToken` / `reportLiveUsage` (Task 9), `translateTextAPI` (existing), `buildTargets` / `pickTarget` (Task 8), `speakText` (existing), `appendTranslationHistory` (existing), `useQuota` (Task 13).
- Produces: the default-exported `LiveWorkspace` component rendered by `LivePage`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/Main/Live/LiveWorkspace.test.js`:

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../../context/LanguageContext';
import LiveWorkspace from './LiveWorkspace';
import { createLiveSession, resolveEngine, ENGINES } from '../../../services/live';
import { requestLiveToken, reportLiveUsage } from '../../../context/LiveApi';
import { translateTextAPI } from '../../../context/ControllerApi';
import { speakText } from '../../../services/speechService';
import { appendTranslationHistory } from '../../../services/historyService';

jest.mock('../../../services/live');
jest.mock('../../../context/LiveApi');
jest.mock('../../../context/ControllerApi');
jest.mock('../../../services/speechService', () => ({ speakText: jest.fn(), stopSpeech: jest.fn() }));
jest.mock('../../../services/historyService', () => ({ appendTranslationHistory: jest.fn() }));
jest.mock('../../../services/settingsService', () => ({ getUserSettings: jest.fn().mockResolvedValue(null) }));
jest.mock('../../../configuration/firebase', () => ({ auth: { currentUser: { uid: 'user-1' } }, db: {} }));
jest.mock('../../../hooks/useQuota', () => () => ({
  uid: 'user-1', liveSecondsUsed: 0, liveSecondsLimit: 600, isLiveOverLimit: false, isOverLimit: false,
}));

let engineHandlers;

const startedSession = { start: jest.fn().mockResolvedValue(undefined), stop: jest.fn().mockResolvedValue(undefined) };

beforeEach(() => {
  resolveEngine.mockReturnValue(ENGINES.GEMINI);
  requestLiveToken.mockResolvedValue({ token: 'tok', remainingSeconds: 600 });
  reportLiveUsage.mockResolvedValue({ billedSeconds: 3 });
  translateTextAPI.mockResolvedValue({ detected: 'Thai', translations: [{ lang: 'English', text: 'Hello' }] });
  appendTranslationHistory.mockResolvedValue([]);
  createLiveSession.mockImplementation((options) => {
    engineHandlers = options;
    return startedSession;
  });
});

afterEach(() => jest.clearAllMocks());

const renderWorkspace = () =>
  render(
    <MemoryRouter>
      <LanguageProvider>
        <LiveWorkspace />
      </LanguageProvider>
    </MemoryRouter>
  );

const startListening = async () => {
  fireEvent.click(screen.getByRole('button', { name: /press and start talking|กดแล้วเริ่มพูด/i }));
  await waitFor(() => expect(createLiveSession).toHaveBeenCalled());
};

test('starting a session mints a token and starts the engine', async () => {
  renderWorkspace();
  await startListening();

  expect(requestLiveToken).toHaveBeenCalledWith('user-1');
  expect(startedSession.start).toHaveBeenCalled();
});

test('a finished utterance is translated and rendered', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });

  await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());
  expect(screen.getByText('สวัสดีครับ')).toBeInTheDocument();
});

test('the translation is spoken when auto-speak is on', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });

  await waitFor(() => expect(speakText).toHaveBeenCalledWith('Hello', 'English'));
});

test('turning auto-speak off stops the speaking', async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole('switch', { name: /read translation aloud|อ่านคำแปลออกเสียง/i }));
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });

  await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());
  expect(speakText).not.toHaveBeenCalled();
});

test('a failed translation shows a retry that re-runs the call', async () => {
  translateTextAPI.mockRejectedValueOnce(new Error('network down'));
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });
  const retry = await screen.findByRole('button', { name: /retry|ลองใหม่/i });

  fireEvent.click(retry);
  await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());
});

test('stopping reports usage and saves the session to history once', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });
  await waitFor(() => expect(screen.getByText('Hello')).toBeInTheDocument());

  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() => expect(reportLiveUsage).toHaveBeenCalledWith('user-1', expect.any(Number)));
  expect(appendTranslationHistory).toHaveBeenCalledTimes(1);
  expect(appendTranslationHistory).toHaveBeenCalledWith('user-1', [
    expect.objectContaining({ sourceText: 'สวัสดีครับ', translatedText: 'Hello', targetLang: 'English' }),
  ]);
});

test('an untranslated utterance is left out of history', async () => {
  translateTextAPI.mockRejectedValue(new Error('network down'));
  renderWorkspace();
  await startListening();

  engineHandlers.onFinal({ text: 'สวัสดีครับ' });
  await screen.findByRole('button', { name: /retry|ลองใหม่/i });

  fireEvent.click(screen.getByRole('button', { name: /listening|กำลังฟัง/i }));

  await waitFor(() => expect(reportLiveUsage).toHaveBeenCalled());
  expect(appendTranslationHistory).not.toHaveBeenCalled();
});

test('a token failure falls back to the browser engine with a notice', async () => {
  requestLiveToken.mockRejectedValue(Object.assign(new Error('no billing'), { status: 502 }));
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();
  await startListening();

  expect(createLiveSession).toHaveBeenCalledWith(expect.objectContaining({ engine: ENGINES.WEB_SPEECH }));
  expect(await screen.findByText(/switched to browser speech recognition|สลับไปใช้การรู้จำเสียง/i)).toBeInTheDocument();
});

test('an exhausted live quota still lets the browser engine run', async () => {
  requestLiveToken.mockRejectedValue(Object.assign(new Error('no seconds left'), { status: 429 }));
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();
  await startListening();

  expect(createLiveSession).toHaveBeenCalledWith(expect.objectContaining({ engine: ENGINES.WEB_SPEECH }));
});

test('a denied microphone shows the permission banner', async () => {
  startedSession.start.mockRejectedValueOnce(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
  renderWorkspace();
  await startListening();

  expect(await screen.findByText(/microphone access was denied|ไม่ได้รับสิทธิ์ใช้ไมโครโฟน/i)).toBeInTheDocument();
});

test('no available engine disables the mic', async () => {
  resolveEngine.mockReturnValue(null);
  renderWorkspace();

  expect(await screen.findByText(/not supported in this browser|ไม่รองรับการพูดแบบเรียลไทม์/i)).toBeInTheDocument();
});

test('interim text renders while speaking', async () => {
  renderWorkspace();
  await startListening();

  engineHandlers.onPartial('สวัส');
  await waitFor(() => expect(screen.getByTestId('interim-text')).toHaveTextContent('สวัส'));
});

test('two-way in browser mode offers one mic per speaker', async () => {
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();

  fireEvent.click(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }));
  fireEvent.click(screen.getByRole('switch', { name: /high quality|โหมดคุณภาพสูง/i }));

  expect(screen.getByRole('button', { name: /speaker 1|คนที่ 1/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /speaker 2|คนที่ 2/i })).toBeInTheDocument();
});

test('each speaker button locks recognition to its own language', async () => {
  resolveEngine.mockReturnValue(ENGINES.WEB_SPEECH);
  renderWorkspace();

  fireEvent.click(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }));
  fireEvent.click(screen.getByRole('switch', { name: /high quality|โหมดคุณภาพสูง/i }));

  fireEvent.click(screen.getByRole('button', { name: /speaker 2|คนที่ 2/i }));
  await waitFor(() => expect(createLiveSession).toHaveBeenCalledWith(expect.objectContaining({ lang: 'Thai' })));
});

test('two-way with Gemini keeps a single shared mic', async () => {
  renderWorkspace();
  fireEvent.click(screen.getByRole('switch', { name: /two-way translation|แปลสองทาง/i }));

  expect(screen.queryByRole('button', { name: /speaker 1|คนที่ 1/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /press and start talking|กดแล้วเริ่มพูด/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `CI=true npx react-scripts test --watchAll=false src/components/Main/Live/LiveWorkspace.test.js`
Expected: FAIL — the placeholder renders an empty div, so the mic button is not found.

- [ ] **Step 3: Write the implementation**

Replace the whole contents of `src/components/Main/Live/LiveWorkspace.js`:

```jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from '../../../context/LanguageContext';
import { auth } from '../../../configuration/firebase';
import useQuota from '../../../hooks/useQuota';
import { createLiveSession, resolveEngine, ENGINES } from '../../../services/live';
import { requestLiveToken, reportLiveUsage } from '../../../context/LiveApi';
import { translateTextAPI } from '../../../context/ControllerApi';
import { buildTargets, pickTarget } from '../../../services/live/direction';
import { speakText } from '../../../services/speechService';
import { appendTranslationHistory } from '../../../services/historyService';
import LanguageSelectorModal from '../CardTranslator/LanguageSelectorModal';
import QuotaExceededModal from '../Modal/QuotaExceededModal';
import ModeTabs from './ModeTabs';
import LanguagePairBar from './LanguagePairBar';
import TwoWayToggle from './TwoWayToggle';
import MicButton from './MicButton';
import TranscriptStream from './TranscriptStream';

const DEFAULT_OBJECTIVE = 'general';
const DEFAULT_FORMALITY = 50;

const LiveWorkspace = () => {
  const { t } = useTranslation();
  const { uid, liveSecondsUsed, liveSecondsLimit } = useQuota();

  const [langA, setLangA] = useState('English');
  const [langB, setLangB] = useState('Thai');
  const [twoWay, setTwoWay] = useState(false);
  const [preferGemini, setPreferGemini] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const [listening, setListening] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const [utterances, setUtterances] = useState([]);
  const [interimText, setInterimText] = useState('');
  const [notice, setNotice] = useState(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [langPicker, setLangPicker] = useState(null);

  const sessionRef = useRef(null);
  const startedAtRef = useRef(null);
  const utterancesRef = useRef([]);
  const autoSpeakRef = useRef(autoSpeak);
  const settingsRef = useRef({ langA: 'English', langB: 'Thai', twoWay: false });

  useEffect(() => { autoSpeakRef.current = autoSpeak; }, [autoSpeak]);
  useEffect(() => { utterancesRef.current = utterances; }, [utterances]);
  useEffect(() => { settingsRef.current = { langA, langB, twoWay }; }, [langA, langB, twoWay]);

  const availableEngine = resolveEngine({ preferGemini, hasToken: true });
  const engineUnavailable = availableEngine === null;
  // Browser recognition needs its language fixed up front, so two-way there
  // splits into one mic per speaker. Gemini detects the language itself.
  const perSpeakerMics = twoWay && availableEngine === ENGINES.WEB_SPEECH;

  const updateUtterance = useCallback((id, patch) => {
    setUtterances((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const translateUtterance = useCallback(async (id, text) => {
    const { langA: a, langB: b, twoWay: isTwoWay } = settingsRef.current;

    try {
      const response = await translateTextAPI({
        uid: auth.currentUser?.uid,
        sourceText: text,
        twoWay: isTwoWay,
        targets: buildTargets({
          twoWay: isTwoWay,
          langA: a,
          langB: b,
          objective: DEFAULT_OBJECTIVE,
          formality: DEFAULT_FORMALITY,
        }),
      });

      const translation = response.translations?.[0];
      const targetLang = translation?.lang
        || (isTwoWay ? pickTarget({ detected: response.detected, langA: a, langB: b }) : b);

      updateUtterance(id, {
        status: 'done',
        translatedText: translation?.text || '',
        targetLang,
        sourceLang: response.detected || a,
      });

      if (autoSpeakRef.current && translation?.text) {
        speakText(translation.text, targetLang);
      }
    } catch (err) {
      if (err.status === 429) setShowQuotaModal(true);
      updateUtterance(id, { status: 'failed' });
    }
  }, [updateUtterance]);

  const handleFinal = useCallback(({ text }) => {
    setInterimText('');
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { langA: a, langB: b } = settingsRef.current;

    setUtterances((current) => [
      ...current,
      { id, sourceText: text, sourceLang: a, translatedText: '', targetLang: b, status: 'pending' },
    ]);

    translateUtterance(id, text);
  }, [translateUtterance]);

  const handleRetry = useCallback((id) => {
    const utterance = utterancesRef.current.find((item) => item.id === id);
    if (!utterance) return;
    updateUtterance(id, { status: 'pending' });
    translateUtterance(id, utterance.sourceText);
  }, [translateUtterance, updateUtterance]);

  const stopListening = useCallback(async () => {
    setListening(false);
    setActiveSpeaker(null);
    setInterimText('');

    const session = sessionRef.current;
    sessionRef.current = null;
    if (session) await session.stop();

    const elapsedSeconds = startedAtRef.current ? (Date.now() - startedAtRef.current) / 1000 : 0;
    startedAtRef.current = null;

    const currentUid = auth.currentUser?.uid || uid;
    if (currentUid && elapsedSeconds > 0) {
      reportLiveUsage(currentUid, elapsedSeconds).catch((err) =>
        console.error('Failed to report live usage', err)
      );
    }

    const saveable = utterancesRef.current
      .filter((item) => item.status === 'done' && item.translatedText)
      .map((item) => ({
        sourceText: item.sourceText,
        sourceLang: item.sourceLang,
        translatedText: item.translatedText,
        targetLang: item.targetLang,
        objective: DEFAULT_OBJECTIVE,
        formality: DEFAULT_FORMALITY,
      }));

    if (currentUid && saveable.length > 0) {
      appendTranslationHistory(currentUid, saveable).catch((err) =>
        console.error('Failed to save live history', err)
      );
    }
  }, [uid]);

  // `speaker` is 1 or 2 and only matters for two-way browser mode, where the
  // engine needs a fixed language and cannot detect who is talking.
  const startListening = useCallback(async (speaker = 1) => {
    setNotice(null);

    let token = null;
    if (preferGemini) {
      try {
        const minted = await requestLiveToken(auth.currentUser?.uid || uid);
        token = minted.token;
      } catch (err) {
        setNotice(t('live.errors.fellBackToBrowser'));
      }
    }

    const engine = resolveEngine({ preferGemini, hasToken: Boolean(token) });
    if (!engine) {
      setNotice(t('live.errors.noEngine'));
      return;
    }

    const { langA: a, langB: b } = settingsRef.current;

    const session = createLiveSession({
      engine,
      lang: speaker === 2 ? b : a,
      token,
      onPartial: setInterimText,
      onFinal: handleFinal,
      onError: (err) => {
        setNotice(err?.name === 'NotAllowedError' ? t('live.errors.micDenied') : t('live.errors.sessionFailed'));
        stopListening();
      },
    });

    sessionRef.current = session;

    try {
      await session.start();
      startedAtRef.current = Date.now();
      setActiveSpeaker(speaker);
      setListening(true);
    } catch (err) {
      sessionRef.current = null;
      setNotice(err?.name === 'NotAllowedError' ? t('live.errors.micDenied') : t('live.errors.sessionFailed'));
    }
  }, [preferGemini, uid, t, handleFinal, stopListening]);

  // A closed tab still owes its seconds.
  useEffect(() => {
    const handleHide = () => {
      if (sessionRef.current) stopListening();
    };
    window.addEventListener('pagehide', handleHide);
    return () => {
      window.removeEventListener('pagehide', handleHide);
      if (sessionRef.current) stopListening();
    };
  }, [stopListening]);

  useEffect(() => {
    if (engineUnavailable) setNotice(t('live.errors.noEngine'));
  }, [engineUnavailable, t]);

  const openPicker = (slot) => setLangPicker(slot);

  const handlePickLanguage = (slot, lang) => {
    if (slot === 'A') setLangA(lang);
    if (slot === 'B') setLangB(lang);
    setLangPicker(null);
  };

  const swapLanguages = () => {
    setLangA(langB);
    setLangB(langA);
  };

  const secondsLeft = Math.max(0, liveSecondsLimit - liveSecondsUsed);

  return (
    <div className="w-full flex-1 flex flex-col items-center gap-6 px-4 py-10 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 text-center">
        {t('live.heading')}
      </h1>

      <ModeTabs mode="translate" onChange={() => {}} />

      <LanguagePairBar
        langA={langA}
        langB={langB}
        onPickA={() => openPicker('A')}
        onPickB={() => openPicker('B')}
        onSwap={swapLanguages}
        disabled={listening}
      />

      <TwoWayToggle
        enabled={twoWay}
        onChange={setTwoWay}
        infoText={preferGemini ? t('live.twoWayInfo') : t('live.twoWayWebSpeechInfo')}
        disabled={listening}
      />

      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('live.highQuality')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={preferGemini}
          aria-label={t('live.highQuality')}
          disabled={listening}
          onClick={() => setPreferGemini((value) => !value)}
          className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
            preferGemini ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${preferGemini ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('live.autoSpeak')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={autoSpeak}
          aria-label={t('live.autoSpeak')}
          onClick={() => setAutoSpeak((value) => !value)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            autoSpeak ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${autoSpeak ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {notice && (
        <p className="w-full rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {notice}
        </p>
      )}

      <TranscriptStream
        utterances={utterances}
        interimText={interimText}
        onRetry={handleRetry}
        emptyLabel={t('live.empty')}
      />

      {perSpeakerMics ? (
        <div className="flex items-end gap-8">
          {[1, 2].map((speaker) => {
            const speakerListening = listening && activeSpeaker === speaker;
            return (
              <MicButton
                key={speaker}
                size="sm"
                state={speakerListening ? 'listening' : 'idle'}
                label={t('live.speaker').replace('{n}', speaker)}
                onClick={() => (speakerListening ? stopListening() : startListening(speaker))}
                disabled={engineUnavailable || (listening && !speakerListening)}
              />
            );
          })}
        </div>
      ) : (
        <MicButton
          state={listening ? 'listening' : 'idle'}
          label={listening ? t('live.listening') : t('live.press')}
          onClick={listening ? stopListening : () => startListening(1)}
          disabled={engineUnavailable}
        />
      )}

      <p className="text-xs text-slate-400">
        {t('live.minutesLeft').replace('{seconds}', secondsLeft)}
      </p>

      <LanguageSelectorModal
        isOpen={langPicker !== null}
        onClose={() => setLangPicker(null)}
        activeCardId={langPicker}
        currentLang={langPicker === 'A' ? langA : langB}
        onSelectLanguage={handlePickLanguage}
      />

      <QuotaExceededModal isOpen={showQuotaModal} onClose={() => setShowQuotaModal(false)} />
    </div>
  );
};

export default LiveWorkspace;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `CI=true npx react-scripts test --watchAll=false src/components/Main/Live/LiveWorkspace.test.js`
Expected: PASS — 16 tests.

- [ ] **Step 5: Run the whole suite**

Run: `CI=true npx react-scripts test --watchAll=false`
Expected: PASS — every suite green.

Run: `cd translator-api && npm test`
Expected: PASS.

- [ ] **Step 6: Lint and build**

Run: `npm run lint`
Expected: no errors.

Run: `CI=true npx react-scripts build`
Expected: "Compiled successfully".

- [ ] **Step 7: Commit**

```bash
git add src/components/Main/Live/LiveWorkspace.js src/components/Main/Live/LiveWorkspace.test.js
git commit -m "feat(live): wire live session orchestration, translation, and history"
```

---

### Task 17: Manual verification with a real microphone

Automated tests mock the microphone, so nothing so far proves audio actually reaches Gemini or that Thai comes back correctly. This task is a human at a keyboard. Report the results — do not mark it done from a passing unit test.

**Files:** none

- [ ] **Step 1: Start the dev server**

Run: `npm start`
Open http://localhost:3000/live in Chrome, signed in.

- [ ] **Step 2: One-way, high quality mode**

Languages English → Thai, two-way off, high quality on, auto-speak on. Press the mic and say "Good morning, how are you today?".

Expected: interim text appears within roughly a second, the settled sentence appears with a Thai translation, and the Thai is spoken aloud.

- [ ] **Step 3: One-way, browser mode**

Turn high quality off and repeat step 2.

Expected: same visible result via `webkitSpeechRecognition`, and no `/api/live-token` request in the Network tab.

- [ ] **Step 4: Two-way with auto-detection**

Turn two-way on with high quality on. Say one English sentence, then one Thai sentence, without touching anything in between.

Expected: the English sentence is translated to Thai and the Thai sentence to English. Direction flips on its own.

- [ ] **Step 5: Two-way in browser mode**

Keep two-way on and turn high quality off.

Expected: the single mic is replaced by two smaller "Speaker 1" / "Speaker 2" buttons. Pressing Speaker 2 recognizes Thai and translates to English; pressing Speaker 1 does the reverse. Only one is active at a time.

- [ ] **Step 6: Denied microphone**

Block the mic for localhost in Chrome's site settings, reload, press the mic.

Expected: the permission banner from `live.errors.micDenied`, and the mic button does not appear to be listening.

- [ ] **Step 7: History**

Press stop after a few sentences, then open `/history`.

Expected: each translated sentence from the session is listed. Sentences that failed to translate are absent.

- [ ] **Step 8: Quota accounting**

Note `live_seconds_today` in Firestore before and after a timed 30-second session.

Expected: it increases by roughly 30, never wildly more.

- [ ] **Step 9: Unsupported browser**

Open `/live` in Safari with high quality mode off.

Expected: the `live.errors.noEngine` banner and a disabled mic button — no crash, no silent dead button.

- [ ] **Step 10: Report**

Write up what passed and what did not. Anything failing here is a bug to fix before this branch merges, not a note to file.

---

## Self-Review Notes

Spec coverage check, section by section:

- Engine abstraction → Tasks 10, 11, 12
- Gemini as speech-to-text only → Task 11 (`gemini-3.5-transcribe-live`, `responseModalities: [TEXT]`)
- Engine selection and fallback → Task 12 (`resolveEngine`), Task 16 (fallback notice on token failure)
- Two-way → Task 5 (backend `twoWay`), Task 8 (direction helpers), Task 16 (wiring)
- Components → Tasks 14, 15, 16
- `/api/live-token` → Task 3
- `/api/live-usage` → Task 4
- Quota model → Tasks 2, 3, 4, 13
- Data flow → Task 16
- Error handling → Task 16 plus per-case tests
- i18n → Task 14
- Testing → every task's TDD steps plus Task 17
- Open dependency (billing) → Task 3 step 2 surfaces the Gemini error verbatim

One spec point intentionally not implemented as written:

1. The spec describes an AudioWorklet. Task 11 uses `ScriptProcessorNode` instead — CRA cannot bundle a separate worklet module file without ejecting or adding a worker loader, and at 4096 samples the callback interval already lands near the 100 ms chunk size Google asks for. The rationale is in the task.

Everything else in the spec, including the per-speaker mic buttons for two-way browser mode, is covered by a task with tests.

---

## As built — deltas from this plan

Executed 2026-09-03 across five parallel sessions with cross-session review. Final state: frontend
suite 121 pass / 0 fail, lint clean, build clean; `translator-api` 97 pass. What differs from the
plan above, and why:

**Environment problems the plan did not anticipate**
- `src/setupTests.js` did not exist anywhere in the repo, so jest-dom matchers were never loaded.
  Added in Task 14.
- `react-router-dom` v7 does not resolve under CRA's jest 27 (package `exports` map). Tests that
  need it mock it; no production code changed.
- Several plan test bodies were wrong and were fixed rather than worked around: Float32 vs float64
  comparison in the PCM tests, a missing `act()` wrap in the useQuota test, and a `@google/genai`
  mock wiped by CRA's `resetMocks: true`.

**Design changes forced by review**
- One shared daily-reset helper. `api/translate.js` originally reset only `tokens_today` while
  writing `last_reset_date`, which permanently locked the Live bucket — whichever endpoint ran first
  each day consumed the flag.
- Live endpoints never write `tokens_today`, and increment `live_seconds_today` atomically. The
  plan's absolute read-modify-write clobbered the token counter that `translate.js` increments,
  which made the daily text cap bypassable by starting and stopping a Live session.
- `/api/live-token` and `/api/live-usage` require a verified Firebase ID token. The plan took `uid`
  from the request body, which let anyone mint unlimited Gemini credentials by varying it.
- New `POST /api/live-confirm` and a `live_session.confirmed` flag. Abandoned-session billing
  charges only confirmed sessions, so a denied microphone or a lost mint response costs nothing.
  Without it, either one billed the full 600-second TTL and locked the user out for the day.
- Quota fields are read with `??`, not `||` — `live_seconds_limit: 0` is how a user is suspended,
  and `0 || 600` granted them the full default.
- `downsampleTo16k` box-filters before decimating. Naive point-sampling folded 12 kHz content down
  to ~4 kHz, on top of speech formants, degrading the exact path sold as "high quality".
- `pickTarget` compares against both languages. One-sided comparison labelled translations with the
  language the user had just spoken whenever the backend's detected name did not string-match the
  configured label (`'Chinese'` vs `'Chinese (Simplified)'`).
- `LiveApi` and `ControllerApi` read the response body as text and parse defensively. Calling
  `.json()` before checking `ok` threw a SyntaxError on Vercel's HTML error pages, so `err.status`
  was never set and the 429 quota modal never opened.
- The usage POST uses `keepalive` and is issued without awaiting anything on the unload path.

**Still open, deliberately**
- `/api/translate` still trusts a body `uid` (pre-existing; TODO in code). CORS is still `*`.
- No `AbortSignal` timeout on the live calls — a hung `/api/live-token` delays the Web Speech
  fallback.
- Cross-tab stale usage reports need a client-generated session id; the server-only half was
  declined rather than shipped broken.
