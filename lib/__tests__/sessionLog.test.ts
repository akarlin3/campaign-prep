import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { formatDuration } from '../sessionLog';

describe('formatDuration', () => {
  it('returns "0m" for negative, zero, and invalid inputs', () => {
    assert.equal(formatDuration(0), '0m');
    assert.equal(formatDuration(-1000), '0m');
    assert.equal(formatDuration(NaN), '0m');
    assert.equal(formatDuration(Infinity), '0m');
    assert.equal(formatDuration(-Infinity), '0m');
  });

  it('formats durations less than an hour in minutes', () => {
    assert.equal(formatDuration(30000), '1m'); // Rounds up/down correctly (30000 / 60000 = 0.5 -> 1)
    assert.equal(formatDuration(29000), '0m'); // 29000 / 60000 = 0.483... -> 0m
    assert.equal(formatDuration(59 * 60000), '59m');
  });

  it('formats exact hours correctly', () => {
    assert.equal(formatDuration(60 * 60000), '1h');
    assert.equal(formatDuration(120 * 60000), '2h');
  });

  it('formats hours and minutes correctly', () => {
    assert.equal(formatDuration(61 * 60000), '1h 1m');
    assert.equal(formatDuration(125 * 60000), '2h 5m');
  });
});
