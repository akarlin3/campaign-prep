import { test } from 'node:test';
import assert from 'node:assert';
import { relativeTime } from '../relativeTime';

test('relativeTime', async (t) => {
  const ONE_SECOND = 1000;
  const ONE_MINUTE = ONE_SECOND * 60;
  const ONE_HOUR = ONE_MINUTE * 60;
  const ONE_DAY = ONE_HOUR * 24;

  const NOW = new Date('2024-01-01T12:00:00Z').getTime();

  t.mock.timers.enable({ apis: ['Date'], now: NOW });

  await t.test('returns "" for null input', () => {
    assert.strictEqual(relativeTime(null), '');
  });

  await t.test('returns "just now" for diff < 60 seconds', () => {
    assert.strictEqual(relativeTime(new Date(NOW)), 'just now');
    assert.strictEqual(relativeTime(new Date(NOW - 59 * ONE_SECOND)), 'just now');
  });

  await t.test('returns "1m ago" for 1 minute ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - ONE_MINUTE)), '1m ago');
    assert.strictEqual(relativeTime(new Date(NOW - ONE_MINUTE - 59 * ONE_SECOND)), '1m ago');
  });

  await t.test('returns "Xm ago" for < 60 minutes ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - 2 * ONE_MINUTE)), '2m ago');
    assert.strictEqual(relativeTime(new Date(NOW - 59 * ONE_MINUTE)), '59m ago');
  });

  await t.test('returns "1h ago" for 1 hour ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - ONE_HOUR)), '1h ago');
    assert.strictEqual(relativeTime(new Date(NOW - ONE_HOUR - 59 * ONE_MINUTE)), '1h ago');
  });

  await t.test('returns "Xh ago" for < 24 hours ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - 2 * ONE_HOUR)), '2h ago');
    assert.strictEqual(relativeTime(new Date(NOW - 23 * ONE_HOUR)), '23h ago');
  });

  await t.test('returns "1d ago" for 1 day ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - ONE_DAY)), '1d ago');
    assert.strictEqual(relativeTime(new Date(NOW - ONE_DAY - 23 * ONE_HOUR)), '1d ago');
  });

  await t.test('returns "Xd ago" for < 30 days ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - 2 * ONE_DAY)), '2d ago');
    assert.strictEqual(relativeTime(new Date(NOW - 29 * ONE_DAY)), '29d ago');
  });

  await t.test('returns "1mo ago" for 1 month ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - 30 * ONE_DAY)), '1mo ago');
    assert.strictEqual(relativeTime(new Date(NOW - 59 * ONE_DAY)), '1mo ago');
  });

  await t.test('returns "Xmo ago" for < 12 months ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - 60 * ONE_DAY)), '2mo ago');
    assert.strictEqual(relativeTime(new Date(NOW - 359 * ONE_DAY)), '11mo ago');
  });

  await t.test('returns "1y ago" for 1 year ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - 365 * ONE_DAY)), '1y ago');
    assert.strictEqual(relativeTime(new Date(NOW - 729 * ONE_DAY)), '1y ago');
  });

  await t.test('returns "Xy ago" for > 1 year ago', () => {
    assert.strictEqual(relativeTime(new Date(NOW - 730 * ONE_DAY)), '2y ago');
  });
});
