import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { totalCost, AbilityScores } from '../pointBuy';

describe('totalCost', () => {
  test('returns 0 when all scores are 8', () => {
    const baseScores: AbilityScores = {
      str: 8,
      dex: 8,
      con: 8,
      int: 8,
      wis: 8,
      cha: 8,
    };
    assert.equal(totalCost(baseScores), 0);
  });

  test('calculates correct cost for standard array (15, 14, 13, 12, 10, 8)', () => {
    const baseScores: AbilityScores = {
      str: 15, // Cost: 9
      dex: 14, // Cost: 7
      con: 13, // Cost: 5
      int: 12, // Cost: 4
      wis: 10, // Cost: 2
      cha: 8,  // Cost: 0
    };
    // 9 + 7 + 5 + 4 + 2 + 0 = 27
    assert.equal(totalCost(baseScores), 27);
  });

  test('calculates correct cost when all scores are maxed out (15)', () => {
    const baseScores: AbilityScores = {
      str: 15,
      dex: 15,
      con: 15,
      int: 15,
      wis: 15,
      cha: 15,
    };
    // 9 * 6 = 54
    assert.equal(totalCost(baseScores), 54);
  });

  test('handles scores not defined in POINT_BUY_COST gracefully (returns 0 cost for out of bounds via costForScore fallback)', () => {
    const baseScores: AbilityScores = {
      str: 20, // Not in cost map, costForScore should return 0
      dex: 8,
      con: 8,
      int: 8,
      wis: 8,
      cha: 8,
    };
    assert.equal(totalCost(baseScores), 0);
  });
});
