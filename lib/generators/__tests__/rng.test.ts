import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { makeRng } from '../rng';

describe('SeededRng', () => {
  it('same seed produces identical sequence', () => {
    const a = makeRng(12345);
    const b = makeRng(12345);
    const seqA = Array.from({ length: 50 }, () => a.next());
    const seqB = Array.from({ length: 50 }, () => b.next());
    assert.deepEqual(seqA, seqB);
  });

  it('different seeds produce different sequences', () => {
    const a = makeRng(1);
    const b = makeRng(2);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    assert.notDeepEqual(seqA, seqB);
  });

  it('values stay in [0, 1)', () => {
    const r = makeRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      assert.ok(v >= 0 && v < 1, `value out of range: ${v}`);
    }
  });

  it('int respects inclusive bounds', () => {
    const r = makeRng(7);
    let minSeen = Infinity, maxSeen = -Infinity;
    for (let i = 0; i < 1000; i++) {
      const v = r.int(3, 10);
      assert.ok(v >= 3 && v <= 10, `value out of range: ${v}`);
      assert.ok(Number.isInteger(v));
      if (v < minSeen) minSeen = v;
      if (v > maxSeen) maxSeen = v;
    }
    // sanity: across 1000 trials, both endpoints should be reachable
    assert.ok(minSeen <= 4);
    assert.ok(maxSeen >= 9);
  });

  it('pick returns an element of the array', () => {
    const r = makeRng(7);
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 100; i++) {
      assert.ok(arr.includes(r.pick(arr)));
    }
  });
});
