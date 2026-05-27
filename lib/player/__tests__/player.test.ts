import { describe, it, expect, beforeEach } from 'vitest';
import { validatePlayerField } from '../allowlist';
import { checkPlayerRateLimit } from '../rate-limit';
import { __resetRateLimitForTests } from '../../rate-limit';

describe('Player Allowlist', () => {
  it('allows valid fields and values', () => {
    expect(validatePlayerField('hp.current', 10)).toBe(true);
    expect(validatePlayerField('hp.temp', 5)).toBe(true);
    expect(validatePlayerField('conditions', ['Poisoned', 'Prone'])).toBe(true);
    expect(validatePlayerField('exhaustion', 3)).toBe(true);
    expect(validatePlayerField('deathSaves.successes', 2)).toBe(true);
    expect(validatePlayerField('deathSaves.failures', 0)).toBe(true);
    expect(validatePlayerField('notes', 'Some custom character notes.')).toBe(true);
    expect(validatePlayerField('goals', ['Defeat the dragon', 'Find the sword'])).toBe(true);
  });

  it('rejects forbidden fields', () => {
    expect(validatePlayerField('name', 'New Name')).toBe(false);
    expect(validatePlayerField('level', 5)).toBe(false);
    expect(validatePlayerField('abilities.STR', 18)).toBe(false);
    expect(validatePlayerField('ac', 18)).toBe(false);
  });

  it('rejects invalid value types for allowed fields', () => {
    expect(validatePlayerField('hp.current', 'ten')).toBe(false);
    expect(validatePlayerField('hp.current', -5)).toBe(false);
    expect(validatePlayerField('conditions', 'Poisoned')).toBe(false);
    expect(validatePlayerField('exhaustion', 10)).toBe(false); // Max exhaustion is 6
    expect(validatePlayerField('deathSaves.successes', 5)).toBe(false); // Max death saves is 3
  });
});

describe('Player Rate Limiting', () => {
  beforeEach(() => {
    __resetRateLimitForTests();
  });

  it('allows requests within limit and rejects past 60 writes per minute', () => {
    const token = 'test-player-token-12345';

    // First 60 requests should pass
    for (let i = 0; i < 60; i++) {
      const res = checkPlayerRateLimit(token);
      expect(res.ok).toBe(true);
    }

    // 61st request should be rate-limited (429 equivalent)
    const limitRes = checkPlayerRateLimit(token);
    expect(limitRes.ok).toBe(false);
    if (!limitRes.ok) {
      expect(limitRes.retryAfterMs).toBeGreaterThan(0);
    }
  });
});
