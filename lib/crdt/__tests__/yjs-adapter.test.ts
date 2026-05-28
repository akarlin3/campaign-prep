import { describe, it, expect } from 'vitest';
import * as Y from 'yjs';
import { applyJsonPatch, seedFromJson, yMapToJson, getRoot } from '../yjs-adapter';

function snap(doc: Y.Doc) {
  return yMapToJson(getRoot(doc));
}

describe('yjs-adapter — seedFromJson + yMapToJson', () => {
  it('round-trips a nested campaign-like JSON shape', () => {
    const doc = new Y.Doc();
    const data = {
      pitch: 'A doomed kingdom',
      tone: ['grim', 'hopeful'],
      npcs: [
        { id: 'n1', name: 'Mara', description: 'innkeeper' },
        { id: 'n2', name: 'Brom' },
      ],
      player: { shareToken: 'abc123', tokenVersion: 1, roster: [{ slotId: 's1', name: 'Avery' }] },
      vivifyHistory: [],
    };
    seedFromJson(doc, data);
    expect(snap(doc)).toEqual(data);
  });
});

describe('yjs-adapter — applyJsonPatch idempotency', () => {
  it('applying the same JSON twice produces no second-pass updates', () => {
    const doc = new Y.Doc();
    const data = { npcs: [{ id: 'n1', name: 'Mara' }], pitch: 'hello' };
    seedFromJson(doc, data);
    let updates = 0;
    doc.on('update', () => { updates += 1; });
    applyJsonPatch(doc, data);
    expect(updates).toBe(0);
  });
});

describe('yjs-adapter — id-keyed array merge', () => {
  it('updates existing entries by id without churning unrelated ones', () => {
    const doc = new Y.Doc();
    seedFromJson(doc, {
      npcs: [
        { id: 'n1', name: 'Mara', description: 'innkeeper' },
        { id: 'n2', name: 'Brom' },
      ],
    });
    applyJsonPatch(doc, {
      npcs: [
        { id: 'n1', name: 'Mara', description: 'cleric' }, // edited
        { id: 'n2', name: 'Brom' },
      ],
    });
    expect(snap(doc).npcs).toEqual([
      { id: 'n1', name: 'Mara', description: 'cleric' },
      { id: 'n2', name: 'Brom' },
    ]);
  });

  it('inserts new entries and removes missing ones', () => {
    const doc = new Y.Doc();
    seedFromJson(doc, { npcs: [{ id: 'n1', name: 'Mara' }, { id: 'n2', name: 'Brom' }] });
    applyJsonPatch(doc, { npcs: [{ id: 'n2', name: 'Brom' }, { id: 'n3', name: 'Cora' }] });
    expect(snap(doc).npcs).toEqual([{ id: 'n2', name: 'Brom' }, { id: 'n3', name: 'Cora' }]);
  });
});

describe('yjs-adapter — state-vector reconciliation', () => {
  it('two divergent docs converge after exchanging updates (both edits survive)', () => {
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    const seed = {
      npcs: [{ id: 'n1', name: 'Mara', description: 'innkeeper' }, { id: 'n2', name: 'Brom' }],
      factions: [{ id: 'f1', name: 'Wardens' }],
      secrets: ['the king is a lich'],
    };
    seedFromJson(docA, seed);
    // Replicate the seed to B exactly so they share a starting state.
    const seedUpdate = Y.encodeStateAsUpdate(docA);
    Y.applyUpdate(docB, seedUpdate);

    // Divergent offline edits.
    applyJsonPatch(docA, {
      ...seed,
      npcs: [{ id: 'n1', name: 'Mara the Cleric', description: 'innkeeper' }, { id: 'n2', name: 'Brom' }],
    });
    applyJsonPatch(docB, {
      ...seed,
      factions: [{ id: 'f1', name: 'Wardens' }, { id: 'f2', name: 'Cabal' }],
      secrets: ['the king is a lich', 'the lich is dying'],
    });

    // Exchange state-vector deltas in both directions.
    const sva = Y.encodeStateVector(docA);
    const svb = Y.encodeStateVector(docB);
    Y.applyUpdate(docA, Y.encodeStateAsUpdate(docB, sva));
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA, svb));

    const a = snap(docA);
    const b = snap(docB);
    expect(a).toEqual(b);
    // All three divergent edits coexist.
    expect(a.npcs.find((n: any) => n.id === 'n1').name).toBe('Mara the Cleric');
    expect(a.factions.map((f: any) => f.id).sort()).toEqual(['f1', 'f2']);
    expect(a.secrets).toContain('the lich is dying');
  });

  it('concurrent appends to the same array (e.g. vivifyHistory) both survive', () => {
    const docA = new Y.Doc();
    const docB = new Y.Doc();
    seedFromJson(docA, { vivifyHistory: [{ id: 'h0', text: 'seed' }] });
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));

    applyJsonPatch(docA, { vivifyHistory: [{ id: 'h0', text: 'seed' }, { id: 'ha', text: 'from A' }] });
    applyJsonPatch(docB, { vivifyHistory: [{ id: 'h0', text: 'seed' }, { id: 'hb', text: 'from B' }] });

    Y.applyUpdate(docA, Y.encodeStateAsUpdate(docB, Y.encodeStateVector(docA)));
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA, Y.encodeStateVector(docB)));

    const a = snap(docA);
    const b = snap(docB);
    expect(a).toEqual(b);
    const ids = a.vivifyHistory.map((e: any) => e.id);
    expect(ids).toContain('ha');
    expect(ids).toContain('hb');
    expect(ids).toContain('h0');
  });
});

describe('yjs-adapter — migration idempotency', () => {
  it('seeding the same JSON twice produces a stable Y.Doc', () => {
    const doc = new Y.Doc();
    const data = {
      pitch: 'hello',
      npcs: [{ id: 'n1', name: 'Mara' }],
      player: { shareToken: 'abc123', tokenVersion: 1, roster: [] },
    };
    seedFromJson(doc, data);
    const state1 = Y.encodeStateAsUpdate(doc);
    // Re-seeding clears + rewrites, then the JSON should match again.
    seedFromJson(doc, data);
    expect(snap(doc)).toEqual(data);
    expect(Y.encodeStateAsUpdate(doc).length).toBeGreaterThan(0);
    // The first state is "valid" — applying it to a fresh doc yields same data.
    const fresh = new Y.Doc();
    Y.applyUpdate(fresh, state1);
    expect(snap(fresh)).toEqual(data);
  });
});

describe('yjs-adapter — vivify history CRDT-aware trim', () => {
  it('post-merge, callers can trim to 50 without losing concurrent appends', () => {
    // Reproduce the cap logic from VivifyPanel: the GM trims to the most
    // recent 50 entries after every change. With Yjs the merged array may
    // briefly exceed 50; the cap is applied post-merge as a normal patch.
    const docA = new Y.Doc();
    seedFromJson(docA, { vivifyHistory: [] });
    const docB = new Y.Doc();
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));

    // Both devices append concurrently while offline.
    const aEntries = Array.from({ length: 30 }, (_, i) => ({ id: `a${i}`, text: `A${i}` }));
    const bEntries = Array.from({ length: 30 }, (_, i) => ({ id: `b${i}`, text: `B${i}` }));
    applyJsonPatch(docA, { vivifyHistory: aEntries });
    applyJsonPatch(docB, { vivifyHistory: bEntries });

    Y.applyUpdate(docA, Y.encodeStateAsUpdate(docB, Y.encodeStateVector(docA)));
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA, Y.encodeStateVector(docB)));

    // Both devices see all 60 entries before trim — no silent loss.
    expect(snap(docA).vivifyHistory.length).toBe(60);
    expect(snap(docB).vivifyHistory.length).toBe(60);

    // Apply the 50-cap as a deterministic post-merge step: keep newest 50
    // by some stable ordering (here: original index in merged array).
    const merged = snap(docA).vivifyHistory.slice(-50);
    applyJsonPatch(docA, { vivifyHistory: merged });
    Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA, Y.encodeStateVector(docB)));
    expect(snap(docA).vivifyHistory.length).toBe(50);
    expect(snap(docB).vivifyHistory.length).toBe(50);
    expect(snap(docA)).toEqual(snap(docB));
  });
});
