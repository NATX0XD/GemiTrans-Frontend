import { renderHook, act } from '@testing-library/react';
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

// Each callback runs in its own act() so the uid state flushes and the
// snapshot effect subscribes before the snapshot itself is delivered.
const emit = (data) => {
  act(() => authCallback({ uid: 'user-1' }));
  act(() => snapshotCallback({ exists: () => true, data: () => data }));
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

// --- the badge must roll over on the clock, not on a round trip --------------

describe('daily rollover', () => {
  const YESTERDAY = '2026-09-03';
  const TODAY = '2026-09-04';

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-04T03:00:00Z')); // 10:00 in Bangkok
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('a counter left over from yesterday reads as zero', () => {
    const { result, rerender } = renderHook(() => useQuota());
    emit({
      tokens_today: 10000,
      daily_limit: 10000,
      live_seconds_today: 600,
      live_seconds_limit: 600,
      last_reset_date: YESTERDAY,
    });
    rerender();

    // Firestore only changes when the API succeeds. While it is failing, the
    // stored number never clears and the user is told they are out of quota on
    // a day they have not spent any.
    expect(result.current.used).toBe(0);
    expect(result.current.isOverLimit).toBe(false);
    expect(result.current.percentage).toBe(0);
    expect(result.current.liveSecondsUsed).toBe(0);
    expect(result.current.isLiveOverLimit).toBe(false);
  });

  test("today's counter is reported as stored", () => {
    const { result, rerender } = renderHook(() => useQuota());
    emit({
      tokens_today: 2500,
      daily_limit: 10000,
      live_seconds_today: 60,
      live_seconds_limit: 600,
      last_reset_date: TODAY,
    });
    rerender();

    expect(result.current.used).toBe(2500);
    expect(result.current.liveSecondsUsed).toBe(60);
  });

  test('the limits survive the rollover — only the counters reset', () => {
    const { result, rerender } = renderHook(() => useQuota());
    emit({
      tokens_today: 9999,
      daily_limit: 25000,
      live_seconds_today: 600,
      live_seconds_limit: 0,
      last_reset_date: YESTERDAY,
    });
    rerender();

    expect(result.current.limit).toBe(25000);
    // A limit of 0 is how an operator suspends a user; the rollover must not
    // hand it back the default.
    expect(result.current.liveSecondsLimit).toBe(0);
    expect(result.current.isLiveOverLimit).toBe(true);
  });
});
