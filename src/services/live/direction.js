const normalize = (value) => String(value || '').trim().toLowerCase();

// Configured labels are qualified ('Chinese (Simplified)', 'Southern Thai dialect')
// but translate.js detects a free-form English name ('Chinese', 'Thai'), so an exact
// comparison alone never matches those pairs. Whole-word only: 'thai' must not match
// inside some longer word, and the detected string is model output, so escape it.
const mentions = (label, word) =>
  new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(normalize(label));

/**
 * Given the language the backend detected, return the one of the two configured
 * languages the user did NOT speak. Used to label two-way results client-side.
 *
 * Only a fallback: `response.translations[0].lang` is the authoritative target and
 * LiveWorkspace prefers it. When the detection matches neither side, or matches both
 * ambiguously, langB is the safe answer rather than a guess.
 */
export const pickTarget = ({ detected, langA, langB }) => {
  const spoken = normalize(detected);
  if (!spoken) return langB;
  if (spoken === normalize(langA)) return langB;
  if (spoken === normalize(langB)) return langA;

  const matchesA = mentions(langA, spoken);
  const matchesB = mentions(langB, spoken);
  if (matchesA && !matchesB) return langB;
  if (matchesB && !matchesA) return langA;

  return langB;
};

/**
 * One-way sends a single target. Two-way sends both, and the backend's `twoWay`
 * flag makes the model return only the non-source one.
 */
export const buildTargets = ({ twoWay, langA, langB, objective, formality }) => {
  const target = (lang) => ({ lang, objective, formality });
  // Two identical sides make "translate into the one that is not the source"
  // unsatisfiable, so the model returns nothing and the utterance hangs pending.
  const canGoBothWays = twoWay && normalize(langA) !== normalize(langB);
  return canGoBothWays ? [target(langA), target(langB)] : [target(langB)];
};
