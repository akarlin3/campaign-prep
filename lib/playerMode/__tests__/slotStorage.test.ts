import { describe, it, expect, beforeEach } from 'vitest';
import { loadSlotChoice, saveSlotChoice, clearSlotChoice } from '../slotStorage';

describe('slotStorage', () => {
  beforeEach(() => window.localStorage.clear());

  it('round-trips a slot choice keyed by token', () => {
    saveSlotChoice({ shareToken: 'tok', tokenVersion: 2, slotId: 'slot-a' });
    expect(loadSlotChoice('tok')).toEqual({ shareToken: 'tok', tokenVersion: 2, slotId: 'slot-a' });
  });

  it('returns null for an unknown token', () => {
    expect(loadSlotChoice('nope')).toBeNull();
  });

  it('does not return a choice stored under a different token', () => {
    saveSlotChoice({ shareToken: 'tok-a', tokenVersion: 1, slotId: 'slot-a' });
    expect(loadSlotChoice('tok-b')).toBeNull();
  });

  it('clear removes the stored choice', () => {
    saveSlotChoice({ shareToken: 'tok', tokenVersion: 1, slotId: 'slot-a' });
    clearSlotChoice('tok');
    expect(loadSlotChoice('tok')).toBeNull();
  });

  it('ignores corrupt JSON', () => {
    window.localStorage.setItem('playerSlot:tok', '{not json');
    expect(loadSlotChoice('tok')).toBeNull();
  });
});
