import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from '../firebase/retry';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTransientError(code: string): Error {
  const err = new Error(`Firestore error: ${code}`) as any;
  err.code = code;
  return err as Error;
}

function makePermanentError(code: string): Error {
  const err = new Error(`Firestore error: ${code}`) as any;
  err.code = code;
  return err as Error;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves immediately when the operation succeeds on the first try', async () => {
    const op = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(op);
    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('retries on a transient error and resolves when the operation eventually succeeds', async () => {
    const transient = makeTransientError('unavailable');
    const op = vi.fn()
      .mockRejectedValueOnce(transient)
      .mockResolvedValue('recovered');

    const promise = withRetry(op);
    // Advance timers to cover the backoff delay
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('recovered');
    expect(op).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry and throws immediately on a permanent error (permission-denied)', async () => {
    const permanent = makePermanentError('permission-denied');
    const op = vi.fn().mockRejectedValue(permanent);

    await expect(withRetry(op)).rejects.toThrow('permission-denied');
    expect(op).toHaveBeenCalledTimes(1);
  });

  it('does NOT retry and throws immediately on other permanent errors', async () => {
    for (const code of ['not-found', 'already-exists', 'invalid-argument']) {
      const permanent = makePermanentError(code);
      const op = vi.fn().mockRejectedValue(permanent);

      await expect(withRetry(op)).rejects.toThrow(code);
      expect(op).toHaveBeenCalledTimes(1);
    }
  });

  it('throws the last error after exhausting all retry attempts on transient errors', async () => {
    const transient = makeTransientError('deadline-exceeded');
    const op = vi.fn().mockRejectedValue(transient);

    const promise = withRetry(op, 3);
    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('deadline-exceeded');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('retries on quota-exceeded (resource-exhausted) transient error', async () => {
    const transient = makeTransientError('resource-exhausted');
    const op = vi.fn()
      .mockRejectedValueOnce(transient)
      .mockRejectedValueOnce(transient)
      .mockResolvedValue('done');

    const promise = withRetry(op, 3);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('done');
    expect(op).toHaveBeenCalledTimes(3);
  });

  it('handles prefixed Firebase error codes like "firestore/unavailable"', async () => {
    const prefixed = makeTransientError('firestore/unavailable');
    const op = vi.fn()
      .mockRejectedValueOnce(prefixed)
      .mockResolvedValue('ok');

    const promise = withRetry(op);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('ok');
    expect(op).toHaveBeenCalledTimes(2);
  });
});
