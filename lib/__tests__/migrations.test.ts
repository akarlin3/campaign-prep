import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
  makeLogId,
  migrateCharacters,
  migrateCharactersAndPcs,
  migrateSessionLogs,
} from '../campaign/migrations';

test('migrateCharacters', async (t) => {
  await t.test('returns an empty characters array when there is no legacy data', () => {
    const out = migrateCharacters({ foo: 'bar' });
    assert.deepEqual(out.characters, []);
    assert.equal(out.foo, 'bar');
  });

  await t.test('folds legacy pc* fields into a single character and drops the legacy keys', () => {
    const out = migrateCharacters({
      pcName: 'Aria',
      pcClass: 'Wizard 3',
      pcBg: 'Sage',
      pcWant: 'knowledge',
      pcFear: 'ignorance',
      pcLove: 'mentor',
      pcFactions: ['Arcane Order', ''],
    });
    assert.equal(out.characters.length, 1);
    const c = out.characters[0];
    assert.equal(c.name, 'Aria');
    assert.equal(c.classLevel, 'Wizard 3');
    assert.equal(c.backstory, 'Sage');
    assert.equal(c.ideals, 'knowledge');
    assert.equal(c.flaws, 'ignorance');
    assert.equal(c.bonds, 'mentor');
    assert.ok(c.notes.includes('Arcane Order'));
    assert.equal(out.pcName, undefined);
    assert.equal(out.pcFactions, undefined);
  });

  await t.test('normalizes an already-migrated characters array without inventing entries', () => {
    const out = migrateCharacters({ characters: [{ name: 'Existing' }] });
    assert.equal(out.characters.length, 1);
    assert.equal(out.characters[0].name, 'Existing');
  });
});

test('migrateCharactersAndPcs', async (t) => {
  await t.test('moves migrated characters into pcs and clears characters', () => {
    const out = migrateCharactersAndPcs({ pcName: 'Borin', pcClass: 'Fighter 1' });
    assert.deepEqual(out.characters, []);
    assert.ok(Array.isArray(out.pcs));
    assert.equal(out.pcs.length, 1);
    assert.equal(out.pcs[0].name, 'Borin');
  });

  await t.test('dedupes against existing pcs by trimmed name', () => {
    const seeded = migrateCharactersAndPcs({ pcName: 'Borin', pcClass: 'Fighter 1' });
    const again = migrateCharactersAndPcs({ ...seeded, pcName: 'Borin', pcClass: 'Fighter 2' });
    assert.equal(again.pcs.length, 1);
  });
});

test('migrateSessionLogs', async (t) => {
  await t.test('promotes legacy logCurrent text into a sessionLogV2 entry', () => {
    const { initialState, initialOpenId } = migrateSessionLogs({ logCurrent: 'We fought a dragon.' });
    assert.equal(initialOpenId, null);
    assert.equal(initialState.logCurrent, undefined);
    assert.equal(initialState.sessionLogV2.length, 1);
    assert.equal(initialState.sessionLogV2[0].recap, 'We fought a dragon.');
  });

  await t.test('preserves existing v2 entries and dedupes by id', () => {
    const existing = { id: 'abc', number: 1, title: 'Old', recap: 'x', events: [] };
    const { initialState } = migrateSessionLogs({
      sessionLogV2: [existing],
      sessionLogs: [{ id: 'abc', title: 'dupe', body: 'y', date: '2024-01-01' }],
    });
    assert.equal(initialState.sessionLogV2.length, 1);
    assert.equal(initialState.sessionLogV2[0].id, 'abc');
  });

  await t.test('passes through when there is nothing legacy to migrate', () => {
    const { initialState } = migrateSessionLogs({ sessionLogV2: [] });
    assert.deepEqual(initialState.sessionLogV2, []);
  });
});

test('makeLogId produces unique non-empty ids', () => {
  const a = makeLogId();
  const b = makeLogId();
  assert.ok(a);
  assert.notEqual(a, b);
});
