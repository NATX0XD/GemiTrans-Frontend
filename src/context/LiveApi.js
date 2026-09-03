import { API_ROOT } from './apiBase';
import { auth } from '../configuration/firebase';

const shapedError = (message, status, data, code) => {
  const error = new Error(message);
  error.status = status;
  error.data = data;
  if (code) error.code = code;
  return error;
};

// The live endpoints verify a Firebase ID token and answer 401 without one.
const idToken = async () => {
  const user = auth.currentUser;
  if (!user) throw shapedError('You need to be signed in to use live translation.', 401, {});
  return user.getIdToken();
};

/**
 * Grab the bearer up front so the unload path never has to await one. Resolves null
 * rather than throwing — a caller doing this speculatively should not have to guard.
 */
export const prefetchIdToken = async () => {
  try {
    return await idToken();
  } catch (err) {
    // Not fatal — the caller can still mint one later — but it silently downgrades
    // the unload path back to awaiting a refresh, so it must not vanish.
    console.error('Failed to cache a live ID token; an unload report may be dropped', err);
    return null;
  }
};

const postJson = async (path, body, { keepalive = false, idToken: presetToken } = {}) => {
  // With a pre-fetched token nothing is awaited before the fetch, so the request is
  // issued in the caller's own turn. That matters on the unload path: getIdToken()
  // does a network refresh once the token expires, and nothing after an await in a
  // pagehide handler is guaranteed to run — keepalive cannot protect a request that
  // was never issued.
  const token = presetToken || await idToken();

  const response = await fetch(`${API_ROOT}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    keepalive,
  });

  // Vercel answers platform failures (500/502/504) with an HTML page and sometimes an
  // empty body. Parsing before the ok check threw a SyntaxError that carried no .status,
  // so callers branching on `err.status === 429` never matched.
  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw shapedError(
      (data && data.message) || `API error: ${response.status}`,
      response.status,
      data || { message: raw.slice(0, 200) }
    );
  }

  // A 200 we cannot read is a server fault. Coercing it to {} made requestLiveToken
  // resolve {token: undefined}, which the workspace then showed the user as
  // "fell back to browser speech" rather than as the outage it is. `status` is a
  // sentinel null so an `err.status >= 500` style check cannot read 200 as the fault.
  if (data === null) {
    throw shapedError(
      'The live service returned an unreadable response.',
      null,
      { message: raw.slice(0, 200) },
      'UNREADABLE_BODY'
    );
  }

  return data;
};

export const requestLiveToken = (uid) => postJson('/live-token', { uid });

/**
 * Mark the minted session as actually started. Abandoned-session billing only charges
 * confirmed sessions, so a mint whose response was lost, or that never opened a
 * socket, costs the user nothing. `uid` is taken from the verified bearer server-side;
 * it stays in the signature only to match the other live calls.
 */
// eslint-disable-next-line no-unused-vars
export const confirmLiveSession = (uid) => postJson('/live-confirm', {});

/**
 * Report a finished session. Always POSTs, including at 0 seconds: the server clamps
 * the charge to 0 but also clears `live_session`, and that is the only way a mint that
 * never produced audio gets released. Skipping it leaves the mint to be billed as an
 * abandoned session for the full TTL on the user's next attempt.
 *
 * Pass `idToken` from `prefetchIdToken` on the unload path — see postJson.
 */
export const reportLiveUsage = async (uid, seconds, { idToken: presetToken } = {}) => {
  const rounded = Math.max(0, Math.ceil(Number(seconds) || 0));
  // Also posted from a pagehide handler, where a plain fetch dies with the document.
  return postJson('/live-usage', { uid, seconds: rounded }, { keepalive: true, idToken: presetToken });
};
