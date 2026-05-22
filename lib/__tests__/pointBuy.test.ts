import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { normalizePointBuy, POINT_BUY_MIN, POINT_BUY_MAX, emptyPointBuy } from '../pointBuy';

describe('normalizePointBuy', () => {
  it('returns empty point buy for null/undefined input', () => {
    assert.deepEqual(normalizePointBuy(null), emptyPointBuy());
    assert.deepEqual(normalizePointBuy(undefined), emptyPointBuy());
  });

  it('returns empty point buy for non-object input', () => {
    assert.deepEqual(normalizePointBuy('not an object'), emptyPointBuy());
    assert.deepEqual(normalizePointBuy(123), emptyPointBuy());
  });

  it('handles valid complete input correctly', () => {
    const input = {
      base: { str: 10, dex: 12, con: 14, int: 15, wis: 8, cha: 11 },
      racial: { str: 2, dex: 1, con: 0, int: 0, wis: 0, cha: 0 }
    };
    const result = normalizePointBuy(input);
    assert.deepEqual(result.base, input.base);
    assert.deepEqual(result.racial, input.racial);
  });

  it('clamps base stats between POINT_BUY_MIN and POINT_BUY_MAX', () => {
    const input = {
      base: { str: 2, dex: 20, con: 14, int: 15, wis: 8, cha: 11 },
      racial: {}
    };
    const result = normalizePointBuy(input);
    assert.equal(result.base.str, POINT_BUY_MIN);
    assert.equal(result.base.dex, POINT_BUY_MAX);
  });

  it('handles missing or invalid stats', () => {
    const input = {
      base: { str: 12, con: 'not a number', int: null, wis: undefined },
      racial: { str: 2, dex: '1' }
    };
    const result = normalizePointBuy(input);
    assert.equal(result.base.str, 12);
    assert.equal(result.base.dex, POINT_BUY_MIN);
    assert.equal(result.base.con, POINT_BUY_MIN);
    assert.equal(result.base.int, POINT_BUY_MIN);
    assert.equal(result.base.wis, POINT_BUY_MIN);

    assert.equal(result.racial.str, 2);
    assert.equal(result.racial.dex, 1);
    assert.equal(result.racial.con, 0);
  });

  it('parses string representations of numbers', () => {
    const input = {
      base: { str: '12', dex: '14' },
      racial: { str: '2', dex: '1' }
    };
    const result = normalizePointBuy(input);
    assert.equal(result.base.str, 12);
    assert.equal(result.base.dex, 14);
    assert.equal(result.racial.str, 2);
    assert.equal(result.racial.dex, 1);
  });

  it('rounds float numbers to integers for base stats and leaves racial stats unrounded but validated', () => {
    const input = {
      base: { str: 10.4, dex: 12.6 },
      racial: { str: 1.1, dex: 0.9 }
    };
    const result = normalizePointBuy(input);
    assert.equal(result.base.str, 10);
    assert.equal(result.base.dex, 13);

    // In normalizePointBuy -> asInt uses Math.round(v) for finite numbers for both base and racial.
    assert.equal(result.racial.str, 1);
    assert.equal(result.racial.dex, 1);
  });

  it('falls back to emptyPointBuy equivalents on entirely missing objects', () => {
    const input = {};
    const result = normalizePointBuy(input);
    assert.deepEqual(result, emptyPointBuy());
  });
});
