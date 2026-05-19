import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { makeRng } from '../rng';
import { applyGeneratorResultToData } from '../save';
import { generateTavern } from '../tavern';
import { generateTreasureHoard } from '../treasure-hoard';
import { generateTrinkets } from '../trinket';
import { generateMundaneShop } from '../mundane-shop';
import { generateDungeon } from '../dungeon';
import { generateSettlement } from '../settlement';
import type { StructuredLocation, StructuredItem, StructuredNpc, GenerationHistoryEntry } from '../types';

describe('applyGeneratorResultToData — save pipeline', () => {
  it('tavern: creates one location, one owner NPC, and one NPC per patron', () => {
    const result = generateTavern({ settlementSize: 'town', vibe: 'cozy' }, makeRng(31));
    const { data, saved } = applyGeneratorResultToData({}, result);
    const locations = data.locations as StructuredLocation[];
    const npcs = data.npcs as StructuredNpc[];
    assert.equal(locations.length, 1);
    assert.equal(locations[0].subtype, 'tavern');
    assert.equal(npcs.length, 1 + result.details.patrons.length);
    assert.ok(npcs.every((n) => n.tier === 'minor'));
    assert.equal(saved.refs.length, 1 + npcs.length);
  });

  it('treasure hoard: creates one summary item plus one item per magic item', () => {
    const result = generateTreasureHoard({ crTier: '11-16', hoardType: 'Treasure Hoard' }, makeRng(33));
    const { data } = applyGeneratorResultToData({}, result);
    const items = data.items as StructuredItem[];
    assert.equal(items.length, 1 + result.magicItems.length);
    assert.ok(items.every((it) => it.source.startsWith('generator:treasure-hoard')));
  });

  it('trinkets: one item per generated trinket', () => {
    const result = generateTrinkets({ count: 4 }, makeRng(41));
    const { data } = applyGeneratorResultToData({}, result);
    const items = data.items as StructuredItem[];
    assert.equal(items.length, 4);
    assert.ok(items.every((it) => it.category === 'trinket'));
  });

  it('mundane shop: creates shop location with shop subtype + minor NPC owner', () => {
    const result = generateMundaneShop({ shopType: 'smith', settlementSize: 'town' }, makeRng(51));
    const { data } = applyGeneratorResultToData({}, result);
    assert.equal((data.locations as StructuredLocation[])[0].subtype, 'shop');
    assert.equal((data.npcs as StructuredNpc[])[0].tier, 'minor');
  });

  it('dungeon: creates exactly one location; rooms live inside details.rooms', () => {
    const result = generateDungeon({ size: 'medium', theme: 'ruin', challengeTier: '5-10' }, makeRng(61));
    const { data } = applyGeneratorResultToData({}, result);
    const locations = data.locations as StructuredLocation[];
    assert.equal(locations.length, 1);
    assert.equal(locations[0].subtype, 'dungeon');
    if (locations[0].details && 'rooms' in locations[0].details) {
      assert.equal(locations[0].details.rooms.length, 10);
    }
  });

  it('settlement: creates location + one NPC per notable', () => {
    const result = generateSettlement({ sizeClass: 'town' }, makeRng(71));
    const { data } = applyGeneratorResultToData({}, result);
    const locations = data.locations as StructuredLocation[];
    const npcs = data.npcs as StructuredNpc[];
    assert.equal(locations.length, 1);
    assert.equal(locations[0].subtype, 'settlement');
    assert.equal(npcs.length, result.details.notables.length);
  });

  it('history: every save appends an entry', () => {
    const r1 = generateTrinkets({ count: 1 }, makeRng(81));
    const r2 = generateTrinkets({ count: 1 }, makeRng(82));
    const step1 = applyGeneratorResultToData({}, r1);
    const step2 = applyGeneratorResultToData(step1.data, r2);
    const history = step2.data.generationsHistory as GenerationHistoryEntry[];
    assert.equal(history.length, 2);
    assert.equal(history[0].kind, 'trinket');
  });

  it('history cap of 20', () => {
    let data: Record<string, unknown> = {};
    for (let i = 0; i < 25; i++) {
      const r = generateTrinkets({ count: 1 }, makeRng(100 + i));
      data = applyGeneratorResultToData(data, r).data;
    }
    const history = data.generationsHistory as GenerationHistoryEntry[];
    assert.equal(history.length, 20);
  });

  it('source tag is set on every created entity', () => {
    const result = generateTavern({ settlementSize: 'town', vibe: 'rough' }, makeRng(91));
    const { data } = applyGeneratorResultToData({}, result);
    const loc = (data.locations as StructuredLocation[])[0];
    assert.equal(loc.source, 'generator:tavern');
    const npcs = data.npcs as StructuredNpc[];
    assert.ok(npcs.every((n) => n.source === 'generator:tavern'));
  });
});
