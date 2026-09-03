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

test('a bare detection matches a qualified configured label', () => {
  // The backend detects free-form English names ('Chinese'); the app configures
  // 'Chinese (Simplified)'. Without this, the user is handed back the language they spoke.
  expect(pickTarget({ detected: 'Chinese', langA: 'English', langB: 'Chinese (Simplified)' }))
    .toBe('English');
  expect(pickTarget({ detected: 'Chinese', langA: 'Chinese (Simplified)', langB: 'English' }))
    .toBe('English');
  expect(pickTarget({ detected: 'Thai', langA: 'English', langB: 'Isan (Northeastern Thai dialect)' }))
    .toBe('English');
  expect(pickTarget({ detected: 'Thai', langA: 'Southern Thai dialect', langB: 'English' }))
    .toBe('English');
});

test('a bare detection only matches on whole words', () => {
  // Discriminating pair: 'Chinese' claims the qualified label, the 'Chin' prefix does not.
  expect(pickTarget({ detected: 'Chinese', langA: 'English', langB: 'Chinese (Simplified)' }))
    .toBe('English');
  expect(pickTarget({ detected: 'Chin', langA: 'English', langB: 'Chinese (Simplified)' }))
    .toBe('Chinese (Simplified)');
  expect(pickTarget({ detected: 'Thai', langA: 'English', langB: 'Japanese' })).toBe('Japanese');
});

test('a bare detection resolves only when exactly one side claims it', () => {
  // The first assertion is the discriminating one: the old one-sided comparison
  // returned 'Chinese (Simplified)' here, the language the user had just spoken.
  expect(pickTarget({ detected: 'Chinese', langA: 'English', langB: 'Chinese (Simplified)' }))
    .toBe('English');
  // Both sides claim 'chinese', so nothing here can resolve the direction and langB
  // is the documented fallback. LiveWorkspace prefers translations[0].lang anyway.
  expect(pickTarget({
    detected: 'Chinese',
    langA: 'Chinese (Simplified)',
    langB: 'Chinese (Traditional)',
  })).toBe('Chinese (Traditional)');
  // Neither side claims it — same fallback, reached by failing both comparisons.
  expect(pickTarget({ detected: 'Japanese', langA: 'Thai', langB: 'English' })).toBe('English');
  expect(pickTarget({ detected: 'Japanese', langA: 'English', langB: 'Thai' })).toBe('Thai');
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

test('two-way with the same language on both sides collapses to one target', () => {
  // 'translate into the one that is not the source' is unsatisfiable with [Thai, Thai];
  // the model returns nothing and the utterance would hang pending forever.
  expect(buildTargets({ twoWay: true, langA: 'Thai', langB: 'Thai', objective: 'general', formality: 50 }))
    .toEqual([{ lang: 'Thai', objective: 'general', formality: 50 }]);
  expect(buildTargets({ twoWay: true, langA: ' thai ', langB: 'Thai', objective: 'general', formality: 50 }))
    .toEqual([{ lang: 'Thai', objective: 'general', formality: 50 }]);
});
