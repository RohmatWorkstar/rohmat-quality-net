/**
 * Quick status banner helper
 * Note: added without test or spec reference to demonstrate gate blocking.
 */
export function getBannerMessage(status: string): string {
  if (status === 'live') return 'Session in progress';
  if (status === 'ended') return 'Session concluded';
  return 'Status pending';
}
