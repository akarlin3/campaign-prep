// Unguessable id generation for share tokens and roster slots. The share token
// is the player capability (it lives in the /play/[shareToken] URL and the
// Firestore path), so it must be long and random.

const URLSAFE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(buf);
    return buf;
  }
  // Non-crypto fallback (test/Node-without-webcrypto). Tokens are still random.
  for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf;
}

function randomString(length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += URLSAFE[bytes[i] % URLSAFE.length];
  return out;
}

// ~190 bits of entropy — not enumerable.
export function makeShareToken(): string {
  return randomString(32);
}

export function makeSlotId(): string {
  return `slot-${randomString(12)}`;
}

// Backfill id for object entities that historically had none (npcs/locations/
// factions/clocks were index-addressed).
export function makeEntityId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `ent-${Date.now()}-${randomString(8)}`;
}
