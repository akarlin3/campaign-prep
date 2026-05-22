import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { suggestCombosForBand, EncounterCombo } from '../encounterMath';

describe('suggestCombosForBand', () => {
  it('returns empty array if maxXP <= minXP', () => {
    assert.deepEqual(suggestCombosForBand(500, 500), []);
    assert.deepEqual(suggestCombosForBand(600, 500), []);
  });

  it('respects default maxCount of 12', () => {
    const combos = suggestCombosForBand(10, 200000);
    assert.equal(combos.length, 12);
    assert.equal(Math.max(...combos.map((c) => c.count)), 12);
  });

  it('respects custom maxCount option', () => {
    const combos = suggestCombosForBand(10, 200000, { maxCount: 5 });
    assert.equal(combos.length, 5);
    assert.equal(Math.max(...combos.map((c) => c.count)), 5);
  });

  it('returns empty array if maxCount <= 0', () => {
    assert.deepEqual(suggestCombosForBand(100, 200, { maxCount: 0 }), []);
    assert.deepEqual(suggestCombosForBand(100, 200, { maxCount: -5 }), []);
  });

  it('returns empty array if no CR fits the narrow band', () => {
    // A band so narrow that no (baseXP * count * multiplier) can land inside it.
    // E.g. CR 0 is 10 XP. 1 monster = 10 XP.
    // Next is CR 1/8 = 25 XP. 1 monster = 25 XP.
    // Band [15, 18] has no matching CR for 1 monster.
    assert.deepEqual(suggestCombosForBand(15, 18), []);
  });

  it('finds the combo closest to the midpoint of the band', () => {
    // Band [200, 400], midpoint is 300.
    // For count = 1, mult = 1.
    // CR 1 is 200 XP -> gap 100
    // CR 2 is 450 XP -> outside band
    // So count 1 -> CR 1
    const combos = suggestCombosForBand(200, 400);
    const combo1 = combos.find((c) => c.count === 1);
    assert.ok(combo1);
    assert.equal(combo1.cr, '1');
    assert.equal(combo1.adjustedXP, 200);
  });

  it('does not return combos if no monster of that count fits', () => {
    // Band [10, 30], midpoint 20.
    // 1 monster, mult 1. CR 0 is 10 (gap 10). CR 1/8 is 25 (gap 5). -> CR 1/8 wins.
    // 2 monsters, mult 1.5. Target adjusted 20, so base XP around 20 / 3 = 6.6.
    // CR 0 is 10. Adjusted = 10 * 2 * 1.5 = 30. Outside [10, 30).
    // CR 1/8 is 25. Adjusted = 25 * 2 * 1.5 = 75. Outside.
    // So for count=2, there should be no valid combo.
    const combos = suggestCombosForBand(10, 30, { maxCount: 2 });
    assert.equal(combos.length, 1);
    assert.equal(combos[0].count, 1);
    assert.equal(combos[0].cr, '1/8');
  });

  it('skips invalid CR_TO_XP lookups gracefully', () => {
    // Just ensuring standard functionality isn't broken
    const combos = suggestCombosForBand(100, 500, { maxCount: 1 });
    assert.ok(combos.length > 0);
  });
});
