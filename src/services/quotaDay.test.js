import { quotaDayString, isQuotaDayCurrent } from './quotaDay';

describe('quotaDayString', () => {
  test('cuts the day at Bangkok midnight, not UTC midnight', () => {
    expect(quotaDayString(new Date('2026-09-03T16:59:00Z'))).toBe('2026-09-03');
    expect(quotaDayString(new Date('2026-09-03T17:00:00Z'))).toBe('2026-09-04');
  });

  test('matches the server rule in translator-api/lib/liveQuota.js', () => {
    expect(quotaDayString(new Date('2026-09-03T23:59:00Z'))).toBe('2026-09-04');
    expect(quotaDayString(new Date('2026-09-03T08:22:00Z'))).toBe('2026-09-03');
  });
});

describe('isQuotaDayCurrent', () => {
  const now = new Date('2026-09-04T03:00:00Z'); // 10:00 in Bangkok on the 4th

  test('yesterday\'s counters are stale', () => {
    expect(isQuotaDayCurrent({ last_reset_date: '2026-09-03' }, now)).toBe(false);
  });

  test('today\'s counters are current', () => {
    expect(isQuotaDayCurrent({ last_reset_date: '2026-09-04' }, now)).toBe(true);
  });

  test('a document written before the reset bookkeeping is taken at face value', () => {
    expect(isQuotaDayCurrent({ tokens_today: 200 }, now)).toBe(true);
    expect(isQuotaDayCurrent(null, now)).toBe(true);
  });

  test('a document stamped at 23:59 Bangkok is stale one minute later', () => {
    const justBefore = new Date('2026-09-03T16:59:00Z');
    const justAfter = new Date('2026-09-03T17:01:00Z');
    const doc = { last_reset_date: quotaDayString(justBefore) };

    expect(isQuotaDayCurrent(doc, justBefore)).toBe(true);
    expect(isQuotaDayCurrent(doc, justAfter)).toBe(false);
  });
});
