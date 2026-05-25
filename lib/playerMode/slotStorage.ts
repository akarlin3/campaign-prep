// Persists a player's chosen roster slot per share token in localStorage, so
// returning to the link skips the picker. There are no player accounts; this is
// purely a convenience (the share token in the URL is the real capability).

export type SlotChoice = {
  shareToken: string;
  tokenVersion: number;
  slotId: string;
};

const key = (token: string) => `playerSlot:${token}`;

export function loadSlotChoice(token: string): SlotChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key(token));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SlotChoice;
    if (parsed && parsed.shareToken === token && typeof parsed.slotId === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

export function saveSlotChoice(choice: SlotChoice): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key(choice.shareToken), JSON.stringify(choice));
  } catch {
    /* storage disabled — fall back to re-picking each visit */
  }
}

export function clearSlotChoice(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key(token));
  } catch {
    /* ignore */
  }
}
