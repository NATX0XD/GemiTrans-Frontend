/**
 * The browser's copy of the server's quota-day rule
 * (translator-api/lib/liveQuota.js). Kept byte-for-byte equivalent on purpose:
 * if the two disagree, the badge and the 429 disagree, which is exactly the
 * confusion this file exists to remove.
 *
 * Asia/Bangkok is a fixed +07:00 with no DST, so shifting the instant is exact.
 * Deliberately NOT the visitor's local timezone — quota is enforced server-side
 * on Bangkok days, and a badge on a laptop set to UTC that rolled over seven
 * hours early would promise tokens the API would still refuse.
 */
export const BANGKOK_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

export const quotaDayString = (date = new Date()) =>
  new Date(date.getTime() + BANGKOK_UTC_OFFSET_MS).toISOString().split('T')[0];

/**
 * Whether a quota document's counters still describe the current quota day.
 *
 * Firestore only changes when the API succeeds, so after midnight in Bangkok the
 * stored `tokens_today` is yesterday's number until the next successful call —
 * and if that call keeps failing, it never updates at all. Reading the counters
 * through this lets the UI roll over on the clock rather than on a round trip.
 *
 * A document with no `last_reset_date` predates the reset bookkeeping; its
 * counters are taken at face value rather than silently zeroed.
 */
export const isQuotaDayCurrent = (quota, now = new Date()) => {
  const storedDay = (quota || {}).last_reset_date;
  if (!storedDay) return true;
  return storedDay === quotaDayString(now);
};
