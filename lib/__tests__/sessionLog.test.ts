import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { formatDuration } from '../sessionLog';

describe('formatDuration', () => {
  it('handles zero or negative inputs by returning 0m', () => {
    assert.equal(formatDuration(0), '0m');
    assert.equal(formatDuration(-1000), '0m');
    assert.equal(formatDuration(-500000), '0m');
  });

  it('handles invalid inputs (NaN, Infinity) by returning 0m', () => {
    assert.equal(formatDuration(NaN), '0m');
    assert.equal(formatDuration(Infinity), '0m');
    assert.equal(formatDuration(-Infinity), '0m');
  });

  it('formats durations less than an hour in minutes', () => {
    assert.equal(formatDuration(30 * 60000), '30m');
    assert.equal(formatDuration(59 * 60000), '59m');
    assert.equal(formatDuration(1 * 60000), '1m');
  });

  it('formats exactly one hour or exact multiple of hours as just hours', () => {
    assert.equal(formatDuration(60 * 60000), '1h');
    assert.equal(formatDuration(120 * 60000), '2h');
    assert.equal(formatDuration(180 * 60000), '3h');
  });

  it('formats durations over an hour as hours and minutes', () => {
    assert.equal(formatDuration(65 * 60000), '1h 5m');
    assert.equal(formatDuration(90 * 60000), '1h 30m');
    assert.equal(formatDuration(150 * 60000), '2h 30m');
  });

  it('rounds properly to the nearest minute', () => {
    // 30 seconds should round up
    assert.equal(formatDuration(30000), '1m');
    // 29 seconds should round down
    assert.equal(formatDuration(29000), '0m');

    // 59 minutes and 30 seconds should round to 1 hour
    assert.equal(formatDuration(59 * 60000 + 30000), '1h');

    // 60 minutes and 30 seconds should round to 1h 1m
    assert.equal(formatDuration(60 * 60000 + 30000), '1h 1m');
  });
});
