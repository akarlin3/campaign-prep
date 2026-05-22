import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { formatDuration } from '../sessionLog';

describe('formatDuration', () => {
  it('returns "0m" for invalid inputs (Infinity, NaN)', () => {
    assert.equal(formatDuration(Infinity), '0m');
    assert.equal(formatDuration(NaN), '0m');
  });

  it('returns "0m" for non-positive values', () => {
    assert.equal(formatDuration(0), '0m');
    assert.equal(formatDuration(-1000), '0m');
  });

  it('returns just minutes when less than 60 minutes', () => {
    // 59.4 minutes -> 59m
    assert.equal(formatDuration(3564000), '59m');
  });

  it('handles exact minute boundaries', () => {
    assert.equal(formatDuration(60000), '1m');
    assert.equal(formatDuration(59 * 60000), '59m');
    assert.equal(formatDuration(60 * 60000), '1h');
  });

  it('handles hours and minutes correctly', () => {
    assert.equal(formatDuration(61 * 60000), '1h 1m');
    assert.equal(formatDuration(90 * 60000), '1h 30m');
    assert.equal(formatDuration(125 * 60000), '2h 5m');
  });

  it('handles rounding to nearest minute', () => {
    // 1.4 minutes -> 1m
    assert.equal(formatDuration(84000), '1m');
    // 1.5 minutes -> 2m
    assert.equal(formatDuration(90000), '2m');
  });

  it('handles rounding up to exact hour', () => {
    // 59.5 minutes -> 60 minutes -> 1h
    assert.equal(formatDuration(59.5 * 60000), '1h');
  });
});
