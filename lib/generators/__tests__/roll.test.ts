import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { makeRng } from '../rng';
import { rollDice, rollMultiple, rollOn, rollOnTiered, weighted } from '../../tables/roll';

describe('rollOn', () => {
  it('uniform table returns elements', () => {
    const rng = makeRng(1);
    const t = ['a', 'b', 'c'];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 9000; i++) counts[rollOn(t, rng)]++;
    // each should appear in roughly 1/3 of trials
    for (const k of t) assert.ok(counts[k] > 2400 && counts[k] < 3600, `${k}: ${counts[k]}`);
  });

  it('weighted table respects weights approximately', () => {
    const rng = makeRng(1);
    const t = weighted({ a: 1, b: 9 });
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 10000; i++) counts[rollOn(t, rng)]++;
    assert.ok(counts.b > counts.a * 5, `b not dominant: a=${counts.a} b=${counts.b}`);
  });

  it('rollOn throws on empty table', () => {
    const rng = makeRng(1);
    assert.throws(() => rollOn([], rng));
  });
});

describe('rollMultiple', () => {
  it('unique:true returns distinct values where possible', () => {
    const rng = makeRng(2);
    const t = ['a', 'b', 'c', 'd'];
    const picked = rollMultiple(t, 4, rng, { unique: true });
    assert.equal(new Set(picked).size, 4);
  });

  it('unique:true stops short rather than infinite-looping when table is too small', () => {
    const rng = makeRng(2);
    const t = ['a', 'b'];
    const picked = rollMultiple(t, 5, rng, { unique: true });
    assert.ok(picked.length <= 2);
  });

  it('non-unique returns exactly n', () => {
    const rng = makeRng(2);
    const picked = rollMultiple(['x'], 7, rng);
    assert.equal(picked.length, 7);
    assert.ok(picked.every((v) => v === 'x'));
  });
});

describe('rollOnTiered', () => {
  it('selects the right sub-table', () => {
    const rng = makeRng(3);
    const out = rollOnTiered({ low: ['x'], high: ['y'] }, 'high', rng);
    assert.equal(out, 'y');
  });
});

describe('rollDice', () => {
  it('1d6 produces values in 1..6', () => {
    const rng = makeRng(3);
    for (let i = 0; i < 1000; i++) {
      const v = rollDice(1, 6, rng);
      assert.ok(v >= 1 && v <= 6);
    }
  });

  it('3d6 produces values in 3..18 with central tendency', () => {
    const rng = makeRng(3);
    let sum = 0; const n = 5000;
    for (let i = 0; i < n; i++) {
      const v = rollDice(3, 6, rng);
      assert.ok(v >= 3 && v <= 18);
      sum += v;
    }
    const mean = sum / n;
    assert.ok(Math.abs(mean - 10.5) < 0.4, `mean off: ${mean}`);
  });
});
