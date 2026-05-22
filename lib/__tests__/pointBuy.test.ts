import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { totalCost, AbilityScores } from '../pointBuy';

describe('totalCost', () => {
  it('returns 0 when all scores are 8', () => {
    const scores: AbilityScores = {
      str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
    };
    assert.equal(totalCost(scores), 0);
  });

  it('returns 54 when all scores are 15', () => {
    const scores: AbilityScores = {
      str: 15, dex: 15, con: 15, int: 15, wis: 15, cha: 15,
    };
    // 9 cost each * 6 abilities = 54
    assert.equal(totalCost(scores), 54);
  });

  it('calculates the correct total cost for a standard array (15, 14, 13, 12, 10, 8)', () => {
    const scores: AbilityScores = {
      str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8,
    };
    // 15->9, 14->7, 13->5, 12->4, 10->2, 8->0. Sum = 9+7+5+4+2+0 = 27
    assert.equal(totalCost(scores), 27);
  });

  it('calculates correctly for arbitrary valid inputs within 8-15 bounds', () => {
    const scores: AbilityScores = {
      str: 9, dex: 11, con: 13, int: 15, wis: 12, cha: 10,
    };
    // 9->1, 11->3, 13->5, 15->9, 12->4, 10->2. Sum = 1+3+5+9+4+2 = 24
    assert.equal(totalCost(scores), 24);
  });

  it('handles gracefully when scores are missing from the mapping by adding 0 (though normally restricted by TS)', () => {
    const scores: AbilityScores = {
      str: 20, // out of bounds normally, costForScore fallback is 0
      dex: 7,  // out of bounds, costForScore fallback is 0
      con: 8,  // cost 0
      int: 9,  // cost 1
      wis: 10, // cost 2
      cha: 11, // cost 3
    };
    // 20->0, 7->0, 8->0, 9->1, 10->2, 11->3. Sum = 6
    assert.equal(totalCost(scores), 6);
  });
});
