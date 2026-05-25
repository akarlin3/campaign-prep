import { describe, it, expect } from 'vitest';
import { initPlayerMode } from '../migration';

describe('initPlayerMode', () => {
  it('initializes a player config on an empty campaign', () => {
    const { data, changed } = initPlayerMode({});
    expect(changed).toBe(true);
    expect(data.player.shareToken).toMatch(/^[A-Za-z0-9]{32}$/);
    expect(data.player.tokenVersion).toBe(1);
    expect(data.player.roster).toEqual([]);
    expect(data.player.fieldDefaults.npcs.name).toBe('public');
    expect(data.player.fieldDefaults.npcs.goal).toBe('private');
  });

  it('backfills ids on object entities without them', () => {
    const { data } = initPlayerMode({
      npcs: [{ name: 'A' }, { name: 'B', id: 'keep' }],
      locations: [{ name: 'L' }],
      factions: [{ name: 'F' }],
      clocks: [{ text: 'C' }],
    });
    expect(typeof data.npcs[0].id).toBe('string');
    expect(data.npcs[0].id).toBeTruthy();
    expect(data.npcs[1].id).toBe('keep');
    expect(typeof data.locations[0].id).toBe('string');
    expect(typeof data.factions[0].id).toBe('string');
    expect(typeof data.clocks[0].id).toBe('string');
  });

  it('migrates legacy isPublic flags into party visibility', () => {
    const { data } = initPlayerMode({
      npcs: [{ id: 'n1', name: 'Public Guy', isPublic: true }, { id: 'n2', name: 'Secret', isPublic: false }],
      locations: [{ id: 'l1', name: 'Town', isPublic: true }],
    });
    expect(data.player.entityVisibility.npcs.n1.mode).toBe('party');
    expect(data.player.entityVisibility.npcs.n2).toBeUndefined();
    expect(data.player.entityVisibility.locations.l1.mode).toBe('party');
  });

  it('is idempotent — second run preserves token and reports no change', () => {
    const first = initPlayerMode({ npcs: [{ id: 'n1', name: 'A', isPublic: true }] });
    const token = first.data.player.shareToken;
    const second = initPlayerMode(first.data);
    expect(second.changed).toBe(false);
    expect(second.data.player.shareToken).toBe(token);
    expect(second.data.npcs[0].id).toBe('n1');
  });

  it('does not clobber GM edits to visibility on re-run', () => {
    const first = initPlayerMode({ npcs: [{ id: 'n1', name: 'A', isPublic: true }] });
    // GM later sets it custom
    first.data.player.entityVisibility.npcs.n1 = { mode: 'custom', allowedSlotIds: ['slot-x'] };
    const second = initPlayerMode(first.data);
    expect(second.data.player.entityVisibility.npcs.n1.mode).toBe('custom');
  });
});
