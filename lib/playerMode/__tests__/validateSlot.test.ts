import { describe, it, expect } from 'vitest';
import { validateSlotClaim } from '../validateSlot';
import type { ShareMeta } from '../types';

const meta: ShareMeta = {
  campaignId: 'camp1',
  campaignName: 'My Campaign',
  tokenVersion: 3,
  roster: [
    { slotId: 'slot-a', displayName: 'Avery' },
    { slotId: 'slot-b', displayName: 'Bree' },
  ],
};
const TOKEN = 'the-real-token';

describe('validateSlotClaim', () => {
  it('accepts a valid slot with matching token and version', () => {
    const r = validateSlotClaim(meta, { shareToken: TOKEN, slotId: 'slot-a', tokenVersion: 3 }, TOKEN);
    expect(r).toEqual({ ok: true, slotId: 'slot-a' });
  });

  it('accepts when client omits version (first visit)', () => {
    const r = validateSlotClaim(meta, { shareToken: TOKEN, slotId: 'slot-b' }, TOKEN);
    expect(r.ok).toBe(true);
  });

  it('rejects when meta is missing (bad/expired token path)', () => {
    const r = validateSlotClaim(null, { shareToken: TOKEN, slotId: 'slot-a' }, TOKEN);
    expect(r).toEqual({ ok: false, reason: 'no-meta' });
  });

  it('rejects a token mismatch', () => {
    const r = validateSlotClaim(meta, { shareToken: 'wrong', slotId: 'slot-a' }, TOKEN);
    expect(r).toEqual({ ok: false, reason: 'token-mismatch' });
  });

  it('rejects a stale version', () => {
    const r = validateSlotClaim(meta, { shareToken: TOKEN, slotId: 'slot-a', tokenVersion: 2 }, TOKEN);
    expect(r).toEqual({ ok: false, reason: 'version-stale' });
  });

  it('rejects an unknown slot', () => {
    const r = validateSlotClaim(meta, { shareToken: TOKEN, slotId: 'slot-zzz' }, TOKEN);
    expect(r).toEqual({ ok: false, reason: 'unknown-slot' });
  });
});
