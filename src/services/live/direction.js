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
