import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { partyThresholds, PartyMember } from '../encounterMath';

describe('partyThresholds', () => {
  it('returns zeros for empty party', () => {
    const res = partyThresholds([]);
    assert.deepEqual(res, { easy: 0, medium: 0, hard: 0, deadly: 0 });
  });

  it('calculates for a basic 4-person party at level 1', () => {
    // level 1 thresholds: easy 25, medium 50, hard 75, deadly 100
    // for 4 players, multiply by 4
    const party: PartyMember[] = [
      { level: 1, weight: 1, gestalt: false },
      { level: 1, weight: 1, gestalt: false },
      { level: 1, weight: 1, gestalt: false },
      { level: 1, weight: 1, gestalt: false },
    ];
    const res = partyThresholds(party);
    assert.deepEqual(res, { easy: 100, medium: 200, hard: 300, deadly: 400 });
  });

  it('applies solo penalty (0.75x) for a solo non-gestalt PC', () => {
    // level 1 thresholds: easy 25, medium 50, hard 75, deadly 100
    // solo penalty 0.75x
    const party: PartyMember[] = [
      { level: 1, weight: 1, gestalt: false },
    ];
    const res = partyThresholds(party);
    assert.deepEqual(res, {
      easy: Math.round(25 * 0.75),
      medium: Math.round(50 * 0.75),
      hard: Math.round(75 * 0.75),
      deadly: Math.round(100 * 0.75),
    });
  });

  it('does not apply solo penalty to a solo gestalt PC', () => {
    // level 1 thresholds: easy 25, medium 50, hard 75, deadly 100
    const party: PartyMember[] = [
      { level: 1, weight: 1, gestalt: true },
    ];
    const res = partyThresholds(party);
    assert.deepEqual(res, { easy: 25, medium: 50, hard: 75, deadly: 100 });
  });

  it('calculates correctly for mixed weights (e.g. sidekicks)', () => {
    // level 2 thresholds: easy 50, medium 100, hard 150, deadly 200
    // 1 PC (weight 1), 1 Sidekick (weight 0.5) => Total weight 1.5 (no solo penalty)
    const party: PartyMember[] = [
      { level: 2, weight: 1, gestalt: false },
      { level: 2, weight: 0.5, gestalt: false },
    ];
    const res = partyThresholds(party);
    assert.deepEqual(res, {
      easy: Math.round(50 * 1 + 50 * 0.5),
      medium: Math.round(100 * 1 + 100 * 0.5),
      hard: Math.round(150 * 1 + 150 * 0.5),
      deadly: Math.round(200 * 1 + 200 * 0.5),
    });
  });

  it('clamps level below 1 to 1', () => {
    const party: PartyMember[] = [
      { level: -5, weight: 1, gestalt: false },
      { level: 0, weight: 1, gestalt: false },
    ];
    // Treats them as level 1. Total weight 2.
    // Level 1: 25, 50, 75, 100 -> for 2 players: 50, 100, 150, 200
    const res = partyThresholds(party);
    assert.deepEqual(res, { easy: 50, medium: 100, hard: 150, deadly: 200 });
  });

  it('clamps level above 20 to 20', () => {
    const party: PartyMember[] = [
      { level: 25, weight: 1, gestalt: false },
      { level: 99, weight: 1, gestalt: false },
    ];
    // Treats them as level 20. Total weight 2.
    // Level 20 thresholds: easy: 2800, medium: 5700, hard: 8500, deadly: 12700
    // For 2 players: easy: 5600, medium: 11400, hard: 17000, deadly: 25400
    const res = partyThresholds(party);
    assert.deepEqual(res, { easy: 5600, medium: 11400, hard: 17000, deadly: 25400 });
  });

  it('rounds floating point levels to nearest int', () => {
    const party: PartyMember[] = [
      { level: 1.4, weight: 1, gestalt: false }, // rounds to 1
      { level: 1.6, weight: 1, gestalt: false }, // rounds to 2
    ];
    // Level 1: 25, 50, 75, 100
    // Level 2: 50, 100, 150, 200
    // Total weight 2 (no solo penalty).
    const res = partyThresholds(party);
    assert.deepEqual(res, {
      easy: 25 + 50,
      medium: 50 + 100,
      hard: 75 + 150,
      deadly: 100 + 200,
    });
  });
});
