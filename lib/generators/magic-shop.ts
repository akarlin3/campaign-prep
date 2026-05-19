import { rollOn } from '@/lib/tables/roll';
import type { SeededRng } from './rng';
import {
  MAGIC_PRICE_GP,
  MAGIC_PRICE_MULT,
  MAGIC_SHOP_NAME_PARTS,
  MAGIC_SIZE_SCARCITY,
  OWNER_DESCRIPTORS,
  OWNER_FIRSTNAMES,
  OWNER_SURNAMES,
  type MagicShopArchetype,
} from './tables/shop-tables';
import { MAGIC_ITEMS } from './tables/treasure-hoard-tables';
import type { ItemRarity, MagicShopResult, SettlementSizeClass, ShopInventoryEntry } from './types';

const RARITY_ORDER: ('common' | 'uncommon' | 'rare' | 'very rare' | 'legendary')[] = [
  'common', 'uncommon', 'rare', 'very rare', 'legendary',
];

function rarityAtOrBelow(max: Exclude<ItemRarity, 'mundane'>): typeof RARITY_ORDER {
  const maxIdx = RARITY_ORDER.indexOf(max as typeof RARITY_ORDER[number]);
  return RARITY_ORDER.slice(0, maxIdx + 1);
}

function priceFor(rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary', archetype: MagicShopArchetype, rng: SeededRng): string {
  const { min, max } = MAGIC_PRICE_GP[rarity];
  const base = rng.int(min, max);
  const adjusted = Math.round(base * MAGIC_PRICE_MULT[archetype]);
  if (adjusted >= 1000) return `${(adjusted / 1000).toFixed(adjusted % 1000 === 0 ? 0 : 1)}k gp`;
  return `${adjusted} gp`;
}

export function generateMagicShop(
  inputs: { maxRarity: Exclude<ItemRarity, 'mundane'>; settlementSize: SettlementSizeClass; archetype: MagicShopArchetype },
  rng: SeededRng,
): MagicShopResult {
  // The smaller of user-selected maxRarity and the settlement scarcity cap.
  const sizeCap = MAGIC_SIZE_SCARCITY[inputs.settlementSize];
  const sizeCapIdx = RARITY_ORDER.indexOf(sizeCap);
  const userIdx = RARITY_ORDER.indexOf(inputs.maxRarity as typeof RARITY_ORDER[number]);
  const effectiveMax = RARITY_ORDER[Math.min(sizeCapIdx, userIdx)];

  const allowedRarities = rarityAtOrBelow(effectiveMax);
  const count = rng.int(3, 8);
  const inventory: ShopInventoryEntry[] = [];
  const seen = new Set<string>();
  let safety = count * 5;
  while (inventory.length < count && safety-- > 0) {
    const rarity = allowedRarities[rng.int(0, allowedRarities.length - 1)];
    const pool = MAGIC_ITEMS[rarity];
    if (!pool?.length) continue;
    const item = pool[rng.int(0, pool.length - 1)];
    if (seen.has(item.name)) continue;
    seen.add(item.name);
    inventory.push({
      name: item.name,
      category: item.category,
      rarity: item.rarity,
      price: priceFor(rarity, inputs.archetype, rng),
      note: item.note,
    });
  }

  const parts = MAGIC_SHOP_NAME_PARTS[inputs.archetype];
  const shopName = `${rollOn(parts.prefix, rng)} ${rollOn(parts.suffix, rng)}`;
  const ownerFirst = rollOn(OWNER_FIRSTNAMES, rng);
  const ownerLast = rollOn(OWNER_SURNAMES, rng);
  const descriptor = rollOn(OWNER_DESCRIPTORS, rng);

  return {
    kind: 'magic-shop',
    id: `magicshop_${rng.seed.toString(16)}`,
    seed: rng.seed,
    inputs,
    shopName,
    owner: { name: `${ownerFirst} ${ownerLast}`, descriptor },
    inventory,
    enhanced: false,
  };
}
