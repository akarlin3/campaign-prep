import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { makeRng } from '../rng';
import { generateTreasureHoard } from '../treasure-hoard';
import { generateTrinkets } from '../trinket';
import { generateMundaneShop } from '../mundane-shop';
import { generateMagicShop } from '../magic-shop';
import { generateTavern } from '../tavern';
import { generateDungeon } from '../dungeon';
import { generateSettlement } from '../settlement';
import { TRINKETS } from '../tables/trinket-tables';
import { MUNDANE_INVENTORY } from '../tables/shop-tables';
import { MAGIC_ITEMS } from '../tables/treasure-hoard-tables';

describe('generateTreasureHoard', () => {
  it('determinism: same seed -> same result', () => {
    const a = generateTreasureHoard({ crTier: '5-10', hoardType: 'Treasure Hoard' }, makeRng(123));
    const b = generateTreasureHoard({ crTier: '5-10', hoardType: 'Treasure Hoard' }, makeRng(123));
    assert.deepEqual(a, b);
  });

  it('individual treasure produces no magic items, no gems', () => {
    for (let s = 1; s <= 50; s++) {
      const r = generateTreasureHoard({ crTier: '5-10', hoardType: 'Individual Treasure' }, makeRng(s));
      assert.equal(r.magicItems.length, 0);
      assert.equal(r.gems.length, 0);
      assert.equal(r.artObjects.length, 0);
    }
  });

  it('high tier hoard coin sum exceeds low tier on average', () => {
    const sumCoins = (c: { cp: number; sp: number; ep: number; gp: number; pp: number }) =>
      c.cp + c.sp + c.ep + c.gp + c.pp;
    const low = Array.from({ length: 200 }, (_, i) => generateTreasureHoard({ crTier: '0-4', hoardType: 'Treasure Hoard' }, makeRng(i)));
    const high = Array.from({ length: 200 }, (_, i) => generateTreasureHoard({ crTier: '17+', hoardType: 'Treasure Hoard' }, makeRng(i)));
    const lowAvg = low.reduce((s, r) => s + sumCoins(r.coins), 0) / low.length;
    const highAvg = high.reduce((s, r) => s + sumCoins(r.coins), 0) / high.length;
    assert.ok(highAvg > lowAvg * 10, `expected high >> low, got low=${lowAvg} high=${highAvg}`);
  });

  it('all referenced magic items exist in the MAGIC_ITEMS pool', () => {
    const allNames = new Set(Object.values(MAGIC_ITEMS).flat().map((m) => m.name));
    for (let s = 0; s < 500; s++) {
      const r = generateTreasureHoard({ crTier: '11-16', hoardType: 'Treasure Hoard' }, makeRng(s));
      for (const mi of r.magicItems) {
        assert.ok(allNames.has(mi.name), `unknown magic item: ${mi.name}`);
      }
    }
  });
});

describe('generateTrinkets', () => {
  it('returns the requested count, capped at 10', () => {
    const r = generateTrinkets({ count: 12 }, makeRng(1));
    assert.equal(r.trinkets.length, 10);
  });

  it('returns distinct trinkets', () => {
    const r = generateTrinkets({ count: 10 }, makeRng(2));
    const set = new Set(r.trinkets.map((t) => t.description));
    assert.equal(set.size, r.trinkets.length);
  });

  it('all trinkets exist in the TRINKETS pool', () => {
    const pool = new Set(TRINKETS);
    for (let s = 0; s < 50; s++) {
      const r = generateTrinkets({ count: 5 }, makeRng(s));
      for (const t of r.trinkets) {
        assert.ok(pool.has(t.description), `unknown trinket: ${t.description}`);
      }
    }
  });
});

describe('generateMundaneShop', () => {
  it('inventory respects settlement availability tiers', () => {
    const allowed = new Set(MUNDANE_INVENTORY.filter((it) => it.shop === 'smith' && it.availability <= 0).map((i) => i.name));
    for (let s = 0; s < 30; s++) {
      const r = generateMundaneShop({ shopType: 'smith', settlementSize: 'thorp' }, makeRng(s));
      for (const it of r.inventory) {
        assert.ok(allowed.has(it.name), `${it.name} should not be available in a thorp`);
      }
    }
  });

  it('produces between 5 and 10 items when stock allows', () => {
    for (let s = 0; s < 30; s++) {
      const r = generateMundaneShop({ shopType: 'general store', settlementSize: 'town' }, makeRng(s));
      assert.ok(r.inventory.length >= 5 && r.inventory.length <= 10, `length ${r.inventory.length}`);
    }
  });
});

describe('generateMagicShop', () => {
  it('respects settlement scarcity cap', () => {
    // In a thorp, max rarity is "common"
    const allowed = new Set(MAGIC_ITEMS.common.map((i) => i.name));
    for (let s = 0; s < 30; s++) {
      const r = generateMagicShop({ archetype: 'curio shop', maxRarity: 'legendary', settlementSize: 'thorp' }, makeRng(s));
      for (const it of r.inventory) {
        assert.ok(allowed.has(it.name), `${it.name} should not appear in a thorp magic shop`);
      }
    }
  });

  it('inventory of unique items', () => {
    const r = generateMagicShop({ archetype: 'curio shop', maxRarity: 'rare', settlementSize: 'large city' }, makeRng(7));
    assert.equal(new Set(r.inventory.map((i) => i.name)).size, r.inventory.length);
  });
});

describe('generateTavern', () => {
  it('produces patrons, menu items, rumors, and an owner', () => {
    const r = generateTavern({ settlementSize: 'town', vibe: 'cozy' }, makeRng(11));
    assert.ok(r.details.patrons.length >= 3);
    assert.ok(r.details.menu.length >= 8);
    assert.ok(r.details.rumors.length >= 2);
    assert.ok(r.details.owner.name);
  });

  it('respects themeKeyword override in name', () => {
    const r = generateTavern({ settlementSize: 'town', vibe: 'themed', themeKeyword: 'Mended' }, makeRng(11));
    assert.ok(/^The Mended /.test(r.name), `got: ${r.name}`);
  });
});

describe('generateDungeon', () => {
  it('room count matches size', () => {
    const sizes = [['small', 5], ['medium', 10], ['large', 20], ['sprawling', 40]] as const;
    for (const [size, count] of sizes) {
      const r = generateDungeon({ size, theme: 'ruin', challengeTier: '5-10' }, makeRng(13));
      assert.equal(r.details.rooms.length, count);
    }
  });

  it('each room has an index, name, contents, and dressing', () => {
    const r = generateDungeon({ size: 'medium', theme: 'tomb', challengeTier: '11-16' }, makeRng(17));
    r.details.rooms.forEach((rm, i) => {
      assert.equal(rm.index, i + 1);
      assert.ok(rm.name);
      assert.ok(rm.contents);
      assert.ok(rm.dressing);
    });
  });
});

describe('generateSettlement', () => {
  it('population falls within size band', () => {
    const r = generateSettlement({ sizeClass: 'town' }, makeRng(21));
    assert.ok(r.details.population >= 201 && r.details.population <= 2000, `pop ${r.details.population}`);
  });

  it('produces at least 1 notable and 2 hooks', () => {
    for (let s = 0; s < 20; s++) {
      const r = generateSettlement({ sizeClass: 'town' }, makeRng(s));
      assert.ok(r.details.notables.length >= 1);
      assert.ok(r.details.hooks.length >= 2);
    }
  });
});
