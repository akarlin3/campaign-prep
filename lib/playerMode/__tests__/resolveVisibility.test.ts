import { describe, it, expect } from 'vitest';
import { resolveVisibility, resolveFieldPrivacy } from '../resolveVisibility';
import { DEFAULT_FIELD_VISIBILITY, cloneDefaultFieldVisibility } from '../fieldDefaults';
import type { FieldVisibilityDefaults } from '../types';

const defaults: FieldVisibilityDefaults = cloneDefaultFieldVisibility();
const npcFields = ['name', 'appearance', 'goal', 'flaw', 'knowledge'];

describe('resolveVisibility — entity-level', () => {
  it('private mode hides everything', () => {
    const r = resolveVisibility({
      entityType: 'npcs',
      visibility: { mode: 'private' },
      slotId: 'slot-a',
      defaults,
      fields: npcFields,
    });
    expect(r.entityVisible).toBe(false);
    expect(r.visibleFields.size).toBe(0);
  });

  it('undefined visibility is treated as private (fail-closed)', () => {
    const r = resolveVisibility({
      entityType: 'npcs',
      visibility: undefined,
      slotId: 'slot-a',
      defaults,
      fields: npcFields,
    });
    expect(r.entityVisible).toBe(false);
  });

  it('party mode shows public fields only', () => {
    const r = resolveVisibility({
      entityType: 'npcs',
      visibility: { mode: 'party' },
      slotId: 'slot-a',
      defaults,
      fields: npcFields,
    });
    expect(r.entityVisible).toBe(true);
    expect([...r.visibleFields].sort()).toEqual(['appearance', 'name']);
  });

  it('custom mode shows only listed slots', () => {
    const vis = { mode: 'custom' as const, allowedSlotIds: ['slot-a'] };
    const seen = resolveVisibility({ entityType: 'npcs', visibility: vis, slotId: 'slot-a', defaults, fields: npcFields });
    const hidden = resolveVisibility({ entityType: 'npcs', visibility: vis, slotId: 'slot-b', defaults, fields: npcFields });
    expect(seen.entityVisible).toBe(true);
    expect(hidden.entityVisible).toBe(false);
  });

  it('custom mode with empty/missing allowedSlotIds shows nobody', () => {
    const r = resolveVisibility({ entityType: 'npcs', visibility: { mode: 'custom' }, slotId: 'slot-a', defaults, fields: npcFields });
    expect(r.entityVisible).toBe(false);
  });

  it('unknown entity type is fully private regardless of mode', () => {
    const r = resolveVisibility({
      entityType: 'spells',
      visibility: { mode: 'party' },
      slotId: 'slot-a',
      defaults,
      fields: ['name', 'level'],
    });
    expect(r.entityVisible).toBe(false);
    expect(r.visibleFields.size).toBe(0);
  });
});

describe('resolveVisibility — field-level', () => {
  it('field overrides win over defaults', () => {
    const r = resolveVisibility({
      entityType: 'npcs',
      visibility: { mode: 'party', fieldOverrides: { goal: 'public', name: 'private' } },
      slotId: 'slot-a',
      defaults,
      fields: npcFields,
    });
    // goal flipped public, name flipped private, appearance still default public
    expect(r.visibleFields.has('goal')).toBe(true);
    expect(r.visibleFields.has('name')).toBe(false);
    expect(r.visibleFields.has('appearance')).toBe(true);
    expect(r.visibleFields.has('flaw')).toBe(false);
  });

  it('missing override falls back to type default', () => {
    const r = resolveVisibility({
      entityType: 'npcs',
      visibility: { mode: 'party', fieldOverrides: { goal: 'public' } },
      slotId: 'slot-a',
      defaults,
      fields: ['appearance', 'flaw'],
    });
    expect(r.visibleFields.has('appearance')).toBe(true); // default public
    expect(r.visibleFields.has('flaw')).toBe(false); // default private
  });

  it('a field not present in defaults or overrides resolves private (fail-closed)', () => {
    const r = resolveVisibility({
      entityType: 'npcs',
      visibility: { mode: 'party' },
      slotId: 'slot-a',
      defaults,
      fields: ['someBrandNewField'],
    });
    expect(r.visibleFields.has('someBrandNewField')).toBe(false);
  });
});

describe('resolveFieldPrivacy', () => {
  it('override beats default beats fail-closed', () => {
    const typeDefaults = DEFAULT_FIELD_VISIBILITY.npcs;
    expect(resolveFieldPrivacy('goal', typeDefaults, { goal: 'public' })).toBe('public');
    expect(resolveFieldPrivacy('goal', typeDefaults, undefined)).toBe('private');
    expect(resolveFieldPrivacy('name', typeDefaults, undefined)).toBe('public');
    expect(resolveFieldPrivacy('totallyUnknown', typeDefaults, undefined)).toBe('private');
  });
});
