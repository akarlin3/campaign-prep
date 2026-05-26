import { describe, it } from 'node:test';
import * as assert from 'node:assert/strict';
import { parseMonsterXP, parseMonsterName, recalculatePartyState, type SessionLogEntry, type LinkedPrepItem } from '../sessionLog';
import { emptyCharacter, type Character } from '../character-schema';

describe('parseMonsterXP', () => {
  it('correctly parses challenge ratings and retrieves XP', () => {
    assert.equal(parseMonsterXP('Goblin — CR 1/4'), 50);
    assert.equal(parseMonsterXP('Bandit Captain, CR 2, ambush'), 450);
    assert.equal(parseMonsterXP('CR 5 Young Red Dragon'), 1800);
    assert.equal(parseMonsterXP('challenge rating 10 boss'), 5900);
    assert.equal(parseMonsterXP('CR: 1/8 bat'), 25);
    assert.equal(parseMonsterXP('unnamed CR 0'), 10);
    assert.equal(parseMonsterXP('No CR specified'), 0);
  });
});

describe('parseMonsterName', () => {
  it('correctly parses monster name from prepped string formats', () => {
    assert.equal(parseMonsterName('Goblin — CR 1/4'), 'Goblin');
    assert.equal(parseMonsterName('Bandit Captain, CR 2, ambush'), 'Bandit Captain');
    assert.equal(parseMonsterName('Kobold · CR 1/8'), 'Kobold');
    assert.equal(parseMonsterName('Troll'), 'Troll');
  });
});

describe('recalculatePartyState', () => {
  it('cascades session XP and linked encounter XP to party total XP and updates characters', () => {
    const sessionLogs: SessionLogEntry[] = [
      {
        id: 's1',
        number: 1,
        date: '2026-05-25',
        startedAt: 1000,
        endedAt: 2000,
        recap: 'Session 1 recap',
        xpAwarded: 500, // Basic XP
        events: [],
        secretsRevealed: [],
        scenesUsed: [],
        goalUpdates: [],
        linkedPrepItems: [
          {
            id: 'npc1',
            type: 'npc',
            snapshotName: 'Gundren Rockseeker',
          },
          {
            id: 'enc1',
            type: 'encounter',
            snapshotName: 'Goblin Ambush',
            snapshotXP: 100, // Encounter XP
          }
        ]
      },
      {
        id: 's2',
        number: 2,
        date: '2026-05-26',
        startedAt: 3000,
        endedAt: 4000,
        recap: 'Session 2 recap',
        xpAwarded: 300, // Basic XP
        events: [],
        secretsRevealed: [],
        scenesUsed: [],
        goalUpdates: [],
        linkedPrepItems: [
          {
            id: 'enc2',
            type: 'encounter',
            snapshotName: 'Bandit Hideout',
            snapshotXP: 450, // Encounter XP
          },
          {
            id: 'loot1',
            type: 'loot',
            snapshotName: '+1 Flame Tongue Rapier',
            snapshotLoot: 'Found in the chest',
          }
        ]
      }
    ];

    const characters: Character[] = [
      { ...emptyCharacter(), id: 'char1', name: 'Valen', experience: '0' },
      { ...emptyCharacter(), id: 'char2', name: 'Lyra', experience: '150' },
    ];

    const result = recalculatePartyState(sessionLogs, characters);

    // Total XP should be 500 + 100 (from enc1) + 300 + 450 (from enc2) = 1350
    assert.equal(result.partyXP, 1350);

    // Party inventory should contain the loot item
    assert.deepEqual(result.partyInventory, ['Found in the chest']);

    // Both character sheets should be updated to show '1350' experience
    assert.equal(result.updatedCharacters[0].experience, '1350');
    assert.equal(result.updatedCharacters[1].experience, '1350');
    assert.equal(result.updatedCharacters[0].name, 'Valen');
    assert.equal(result.updatedCharacters[1].name, 'Lyra');
  });

  it('handles empty entries or missing linked items list without crashing', () => {
    const characters: Character[] = [
      { ...emptyCharacter(), id: 'char1', name: 'Valen', experience: '100' }
    ];
    const result = recalculatePartyState([], characters);

    assert.equal(result.partyXP, 0);
    assert.deepEqual(result.partyInventory, []);
    assert.equal(result.updatedCharacters[0].experience, '0');
  });
});
