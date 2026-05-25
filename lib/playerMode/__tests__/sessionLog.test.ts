import { describe, it, expect } from 'vitest';
import { applyNarrationReveal, upgradeForMention, type Mention } from '../sessionLog';
import type { PlayerConfig } from '../types';

function cfg(entityVisibility: PlayerConfig['entityVisibility'] = {}): PlayerConfig {
  return { shareToken: 't', tokenVersion: 1, roster: [], fieldDefaults: {}, entityVisibility };
}

const npcMention: Mention[] = [{ entityType: 'npcs', entityId: 'n1', label: 'Sera' }];

describe('upgradeForMention', () => {
  it('party entry upgrades a private/undefined entity to party', () => {
    expect(upgradeForMention(undefined, { mode: 'party' })).toMatchObject({ mode: 'party' });
    expect(upgradeForMention({ mode: 'private' }, { mode: 'party' })).toMatchObject({ mode: 'party' });
  });
  it('party entry does not narrow an already-custom entity', () => {
    const cur = { mode: 'custom' as const, allowedSlotIds: ['s1'] };
    expect(upgradeForMention(cur, { mode: 'party' })).toBe(cur);
  });
  it('custom entry seeds slots on a private entity and preserves field overrides', () => {
    const r = upgradeForMention({ mode: 'private', fieldOverrides: { goal: 'public' } }, { mode: 'custom', allowedSlotIds: ['s1'] });
    expect(r).toMatchObject({ mode: 'custom', allowedSlotIds: ['s1'], fieldOverrides: { goal: 'public' } });
  });
  it('custom entry unions slots on an existing custom entity', () => {
    const r = upgradeForMention({ mode: 'custom', allowedSlotIds: ['s1'] }, { mode: 'custom', allowedSlotIds: ['s2'] });
    expect((r as any).allowedSlotIds.sort()).toEqual(['s1', 's2']);
  });
  it('custom entry leaves a party entity alone (party is broader)', () => {
    const cur = { mode: 'party' as const };
    expect(upgradeForMention(cur, { mode: 'custom', allowedSlotIds: ['s1'] })).toBe(cur);
  });
});

describe('applyNarrationReveal', () => {
  it('reveals a mentioned private NPC to the party', () => {
    const c = applyNarrationReveal(cfg(), npcMention, { mode: 'party' });
    expect(c.entityVisibility.npcs!.n1.mode).toBe('party');
  });
  it('reveals only to the entry’s custom slot', () => {
    const c = applyNarrationReveal(cfg(), npcMention, { mode: 'custom', allowedSlotIds: ['slot-b'] });
    expect(c.entityVisibility.npcs!.n1).toMatchObject({ mode: 'custom', allowedSlotIds: ['slot-b'] });
  });
  it('is sticky — does not downgrade an already-party entity', () => {
    const c = applyNarrationReveal(cfg({ npcs: { n1: { mode: 'party' } } }), npcMention, { mode: 'custom', allowedSlotIds: ['slot-b'] });
    expect(c.entityVisibility.npcs!.n1.mode).toBe('party');
  });
  it('no mentions → config unchanged (same reference)', () => {
    const c = cfg();
    expect(applyNarrationReveal(c, [], { mode: 'party' })).toBe(c);
  });
});
