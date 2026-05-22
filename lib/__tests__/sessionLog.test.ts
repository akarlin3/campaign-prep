import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { summarizeEvents } from '../sessionLog';
import { ChangeEvent } from '../sessionEvents';

describe('summarizeEvents', () => {
  test('returns 0 for all properties when given an empty array', () => {
    const result = summarizeEvents([]);
    assert.deepStrictEqual(result, { kept: 0, dismissed: 0, starred: 0 });
  });

  test('counts items without dismissed flag as kept', () => {
    const events = [
      { id: '1', kind: 'fact', diffs: [] },
      { id: '2', kind: 'fact', diffs: [] },
    ] as ChangeEvent[];

    const result = summarizeEvents(events);
    assert.deepStrictEqual(result, { kept: 2, dismissed: 0, starred: 0 });
  });

  test('counts items with dismissed flag as dismissed', () => {
    const events = [
      { id: '1', kind: 'fact', diffs: [], dismissed: true },
      { id: '2', kind: 'fact', diffs: [], dismissed: true },
    ] as ChangeEvent[];

    const result = summarizeEvents(events);
    assert.deepStrictEqual(result, { kept: 0, dismissed: 2, starred: 0 });
  });

  test('counts items with starred flag as starred', () => {
    const events = [
      { id: '1', kind: 'fact', diffs: [], starred: true },
      { id: '2', kind: 'fact', diffs: [] }, // kept but not starred
    ] as ChangeEvent[];

    const result = summarizeEvents(events);
    assert.deepStrictEqual(result, { kept: 2, dismissed: 0, starred: 1 });
  });

  test('handles a mix of kept, dismissed, and starred items correctly', () => {
    const events = [
      { id: '1', kind: 'fact', diffs: [] }, // kept
      { id: '2', kind: 'fact', diffs: [], dismissed: true }, // dismissed
      { id: '3', kind: 'fact', diffs: [], starred: true }, // kept, starred
      { id: '4', kind: 'fact', diffs: [], dismissed: true, starred: true }, // dismissed, starred
      { id: '5', kind: 'fact', diffs: [] }, // kept
    ] as ChangeEvent[];

    // Kept: 1, 3, 5 (total 3)
    // Dismissed: 2, 4 (total 2)
    // Starred: 3, 4 (total 2)

    const result = summarizeEvents(events);
    assert.deepStrictEqual(result, { kept: 3, dismissed: 2, starred: 2 });
  });
});
