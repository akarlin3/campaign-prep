import { describe, it, expect } from 'vitest';
import { removeSlotFromConfig } from '../roster';
import type { PlayerConfig } from '../types';

function cfg(): PlayerConfig {
  return {
    shareToken: 't', tokenVersion: 1,
    roster: [{ slotId: 'a', displayName: 'A' }, { slotId: 'b', displayName: 'B' }],
    fieldDefaults: {},
    entityVisibility: {
      npcs: {
        n1: { mode: 'custom', allowedSlotIds: ['a', 'b'] },
        n2: { mode: 'party' },
      },
    },
    handouts: { mode: 'custom', allowedSlotIds: ['a', 'b'] },
  };
}

describe('removeSlotFromConfig', () => {
  it('removes the slot from the roster', () => {
    const next = removeSlotFromConfig(cfg(), 'a');
    expect(next.roster.map((s) => s.slotId)).toEqual(['b']);
  });

  it('scrubs the slot from every custom allow-list (entities + handouts)', () => {
    const next = removeSlotFromConfig(cfg(), 'a');
    expect(next.entityVisibility.npcs!.n1.allowedSlotIds).toEqual(['b']);
    expect(next.handouts!.allowedSlotIds).toEqual(['b']);
  });

  it('leaves party-mode entities untouched', () => {
    const next = removeSlotFromConfig(cfg(), 'a');
    expect(next.entityVisibility.npcs!.n2.mode).toBe('party');
  });

  it('does not mutate the original config', () => {
    const c = cfg();
    removeSlotFromConfig(c, 'a');
    expect(c.entityVisibility.npcs!.n1.allowedSlotIds).toEqual(['a', 'b']);
  });
});
