import { describe, test } from 'node:test';
import assert from 'node:assert';
import { normalizePointBuy, POINT_BUY_MIN } from '../pointBuy.js';

describe('normalizePointBuy', () => {
  const defaultBase = {
    str: POINT_BUY_MIN,
    dex: POINT_BUY_MIN,
    con: POINT_BUY_MIN,
    int: POINT_BUY_MIN,
    wis: POINT_BUY_MIN,
    cha: POINT_BUY_MIN,
  };

  const defaultRacial = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  };

  test('returns default values for falsy and non-object inputs', () => {
    const expected = { base: defaultBase, racial: defaultRacial };

    assert.deepStrictEqual(normalizePointBuy(undefined), expected);
    assert.deepStrictEqual(normalizePointBuy(null), expected);
    assert.deepStrictEqual(normalizePointBuy(false), expected);
    assert.deepStrictEqual(normalizePointBuy(0), expected);
    assert.deepStrictEqual(normalizePointBuy(''), expected);
    assert.deepStrictEqual(normalizePointBuy('invalid'), expected);
  });

  test('returns default values for empty objects', () => {
    const expected = { base: defaultBase, racial: defaultRacial };
    assert.deepStrictEqual(normalizePointBuy({}), expected);
    assert.deepStrictEqual(normalizePointBuy([]), expected);
  });

  test('handles valid numbers correctly', () => {
    const input = {
      base: { str: 10, dex: 12, con: 14, int: 8, wis: 15, cha: 13 },
      racial: { str: 2, dex: 1, con: 0, int: 0, wis: 1, cha: 0 }
    };

    const result = normalizePointBuy(input);
    assert.deepStrictEqual(result.base, input.base);
    assert.deepStrictEqual(result.racial, input.racial);
  });

  test('parses numeric strings according to actual logic', () => {
    const input = {
      base: { str: '10', dex: '12', con: '14', int: '8', wis: '15', cha: '13' },
      racial: { str: '2', dex: '1', con: '0', int: '0', wis: '1', cha: '0' }
    };

    const expected = {
      base: { str: 10, dex: 12, con: 14, int: 8, wis: 15, cha: 13 },
      racial: { str: 2, dex: 1, con: 0, int: 0, wis: 1, cha: 0 }
    };

    assert.deepStrictEqual(normalizePointBuy(input), expected);
  });

  test('falls back to defaults for invalid strings', () => {
    const input = {
      base: { str: 'foo', dex: 'bar', con: 'baz', int: '10x', wis: ' ', cha: 'NaN' },
      racial: { str: 'foo', dex: 'bar', con: 'baz', int: '10x', wis: ' ', cha: 'NaN' }
    };

    const expected = {
      base: { str: 8, dex: 8, con: 8, int: 10, wis: 8, cha: 8 },
      racial: { str: 0, dex: 0, con: 0, int: 10, wis: 0, cha: 0 }
    };

    assert.deepStrictEqual(normalizePointBuy(input), expected);
  });

  test('clamps base scores between 8 and 15', () => {
    const input = {
      base: { str: 5, dex: -10, con: 20, int: 16, wis: Infinity, cha: -Infinity },
    };

    const expectedBase = {
      str: 8,
      dex: 8,
      con: 15,
      int: 15,
      wis: 8,
      cha: 8,
    };

    const result = normalizePointBuy(input);
    assert.deepStrictEqual(result.base, expectedBase);
  });

  test('racial defaults logic when invalid', () => {
    const input = {
      racial: { str: -2, dex: 5, con: 20, int: Infinity, wis: NaN, cha: -Infinity },
    };

    const expectedRacial = {
      str: -2,
      dex: 5,
      con: 20,
      int: 0,
      wis: 0,
      cha: 0,
    };

    const result = normalizePointBuy(input);
    assert.deepStrictEqual(result.racial, expectedRacial);
  });

  test('fills missing keys with defaults', () => {
    const input = {
      base: { str: 14 },
      racial: { dex: 2 }
    };

    const expected = {
      base: { ...defaultBase, str: 14 },
      racial: { ...defaultRacial, dex: 2 }
    };

    assert.deepStrictEqual(normalizePointBuy(input), expected);
  });

  test('rounds numbers correctly', () => {
    const input = {
      base: { str: 10.4, dex: 10.5, con: 14.9, int: 7.5, wis: 15.1, cha: 15.9 },
      racial: { str: 1.4, dex: 1.5, con: 1.9, int: -1.5, wis: -1.6, cha: 0.1 }
    };

    const expected = {
      base: {
        str: 10,
        dex: 11,
        con: 15,
        int: 8,
        wis: 15,
        cha: 15
      },
      racial: {
        str: 1,
        dex: 2,
        con: 2,
        int: -1,
        wis: -2,
        cha: 0
      }
    };

    assert.deepStrictEqual(normalizePointBuy(input), expected);
  });
});
