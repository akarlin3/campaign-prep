// Pure validation for a player claiming a roster slot from a share link.
//
// NOTE on the architecture pivot (see docs/player-mode-audit.md §3, §5): the
// original plan called for a privileged /api/play/claim-slot route that set a
// Firebase custom claim via the Admin SDK. That is not implementable here —
// org policy blocks service-account-key creation, so the Admin SDK is
// unavailable for new features. Players are therefore unauthenticated and the
// share token in the path is the capability. "Claiming" a slot is a purely
// client-side choice (persisted to localStorage); the only validation that
// matters is "does this token+version+slot resolve against the public meta
// doc?" — which is exactly this function. There is no privileged write to
// perform, so no network round-trip is required for security.

import type { ShareMeta } from './types';

export type SlotClaimInput = {
  shareToken: string;
  slotId: string;
  // Version the client last saw (e.g. from localStorage). Optional on first visit.
  tokenVersion?: number;
};

export type SlotClaimResult =
  | { ok: true; slotId: string }
  | { ok: false; reason: 'no-meta' | 'token-mismatch' | 'version-stale' | 'unknown-slot' };

export function validateSlotClaim(
  meta: ShareMeta | null | undefined,
  input: SlotClaimInput,
  expectedToken: string,
): SlotClaimResult {
  if (!meta) return { ok: false, reason: 'no-meta' };
  if (input.shareToken !== expectedToken) return { ok: false, reason: 'token-mismatch' };
  if (typeof input.tokenVersion === 'number' && input.tokenVersion !== meta.tokenVersion) {
    return { ok: false, reason: 'version-stale' };
  }
  const slot = (meta.roster ?? []).find((s) => s.slotId === input.slotId);
  if (!slot) return { ok: false, reason: 'unknown-slot' };
  return { ok: true, slotId: slot.slotId };
}
