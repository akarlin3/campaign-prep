import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { encounterMultiplier } from '../encounterMath';

test('encounterMultiplier', async (t) => {
  await t.test('single monster', () => {
    assert.equal(encounterMultiplier(1), 1);
  });

  await t.test('pair of monsters', () => {
    assert.equal(encounterMultiplier(2), 1.5);
  });

  await t.test('small group (3-6)', () => {
    assert.equal(encounterMultiplier(3), 2);
    assert.equal(encounterMultiplier(4), 2);
    assert.equal(encounterMultiplier(5), 2);
    assert.equal(encounterMultiplier(6), 2);
  });

  await t.test('medium group (7-10)', () => {
    assert.equal(encounterMultiplier(7), 2.5);
    assert.equal(encounterMultiplier(8), 2.5);
    assert.equal(encounterMultiplier(9), 2.5);
    assert.equal(encounterMultiplier(10), 2.5);
  });

  await t.test('large group (11-14)', () => {
    assert.equal(encounterMultiplier(11), 3);
    assert.equal(encounterMultiplier(12), 3);
    assert.equal(encounterMultiplier(13), 3);
    assert.equal(encounterMultiplier(14), 3);
  });

  await t.test('horde (15+)', () => {
    assert.equal(encounterMultiplier(15), 4);
    assert.equal(encounterMultiplier(20), 4);
    assert.equal(encounterMultiplier(100), 4);
  });

  await t.test('edge cases (0 or negative)', () => {
    // The current code actually returns 2 for values <= 6 and != 1 or 2, including 0 or negative
    // But encounterMultiplier logic assumes positive counts
    assert.equal(encounterMultiplier(0), 2);
    assert.equal(encounterMultiplier(-1), 2);
  });
});
