/**
 * Maps a /api/translate failure to the i18n key under `translator.workspace`.
 *
 * Previously everything that was not a 429 collapsed into `translationFailed`,
 * so an overloaded upstream model — which clears on its own and costs the user
 * nothing — read exactly like a broken app and gave no useful advice.
 */
export const translationErrorKey = (error) => {
  const status = (error || {}).status;

  if (status === 429) return 'quotaExceeded';

  // 503 is the only status this API answers for "busy, try again", and Vercel
  // uses the same one for its own overload — where there is no body to read a
  // code from.
  if (status === 503 || (error || {}).data?.code === 'MODEL_OVERLOADED') return 'modelBusy';

  return 'translationFailed';
};
