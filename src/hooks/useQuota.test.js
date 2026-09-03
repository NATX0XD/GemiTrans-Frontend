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
