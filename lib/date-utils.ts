// Local-timezone date/time helpers shared across editor tabs.
//
// These intentionally operate in the user's local timezone (not UTC) so that
// `<input type="date">` / `<input type="time">` round-trip values map to what
// the GM sees on the clock in front of them. For UTC/ISO day strings use
// `todayISO` from `@/lib/sessionLog`.

/** Local-timezone `YYYY-MM-DD` for a millisecond timestamp. */
export function getLocalDateString(ms: number): string {
  const d = new Date(ms);
  const YYYY = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const DD = String(d.getDate()).padStart(2, '0');
  return `${YYYY}-${MM}-${DD}`;
}

/** Local-timezone `HH:MM` (24h) for a millisecond timestamp. */
export function getLocalTimeString(ms: number): string {
  const d = new Date(ms);
  const HH = String(d.getHours()).padStart(2, '0');
  const MM = String(d.getMinutes()).padStart(2, '0');
  return `${HH}:${MM}`;
}

/** Combine a local `YYYY-MM-DD` date and `HH:MM` time into a millisecond timestamp. */
export function parseLocalStart(dateStr: string, timeStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}
