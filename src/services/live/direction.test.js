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
