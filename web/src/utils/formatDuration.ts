/**
 * Formats interview session elapsed time into human-readable MM:SS or HH:MM:SS format.
 * Requirement reference: PRD-02 Session Duration Display & Monitoring
 *
 * @param seconds - Total elapsed seconds
 * @returns Formatted duration string (e.g. "04:15", "01:23:45")
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) {
    return '00:00';
  }

  const rounded = Math.floor(seconds);
  const hrs = Math.floor(rounded / 3600);
  const mins = Math.floor((rounded % 3600) / 60);
  const secs = rounded % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }

  return `${pad(mins)}:${pad(secs)}`;
}
