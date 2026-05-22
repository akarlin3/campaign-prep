// 5e encumbrance + currency math.
//
// 5e SRD: lift = Str * 15, push/drag = Str * 30. Optional encumbrance:
//   • Encumbered    > Str * 5  (speed −10)
//   • Heavily Enc.  > Str * 10 (speed −20, disadv. on Str/Dex/Con checks/saves/attacks)
//   • Over capacity > Str * 15 (cannot move except 5 ft drag)

export type EncumbranceTier =
  | 'unencumbered'
  | 'encumbered'
  | 'heavily-encumbered'
  | 'overburdened';

export type EncumbranceResult = {
  carriedLb: number;
  capacityLb: number;
  liftLb: number;
  dragLb: number;
  tier: EncumbranceTier;
  speedPenaltyFt: number;
  /** True if the heavy-encumbrance disadvantage clause kicks in. */
  disadvantage: boolean;
};

export function encumbrance(params: {
  strength: number;
  carriedLb: number;
  sizeMultiplier?: number;
}): EncumbranceResult {
  const sz = params.sizeMultiplier ?? 1;
  const cap = params.strength * 15 * sz;
  const enc5 = params.strength * 5 * sz;
  const enc10 = params.strength * 10 * sz;
  const lift = params.strength * 15 * sz;
  const drag = params.strength * 30 * sz;
  let tier: EncumbranceTier = 'unencumbered';
  let speedPenaltyFt = 0;
  let disadvantage = false;
  if (params.carriedLb > cap) {
    tier = 'overburdened';
    speedPenaltyFt = 25;
    disadvantage = true;
  } else if (params.carriedLb > enc10) {
    tier = 'heavily-encumbered';
    speedPenaltyFt = 20;
    disadvantage = true;
  } else if (params.carriedLb > enc5) {
    tier = 'encumbered';
    speedPenaltyFt = 10;
  }
  return {
    carriedLb: params.carriedLb,
    capacityLb: cap,
    liftLb: lift,
    dragLb: drag,
    tier,
    speedPenaltyFt,
    disadvantage,
  };
}

// Size category multipliers from PHB ch. 9 (Tiny .5 / Small 1 / Med 1 /
// Large 2 / Huge 4 / Gargantuan 8). Small is technically 1x in 5e despite
// the "Variant Encumbrance" disagreements; we mirror the SRD.
export const SIZE_MULTIPLIERS: Record<string, number> = {
  Tiny: 0.5, Small: 1, Medium: 1, Large: 2, Huge: 4, Gargantuan: 8,
};

// Currency: standard 5e rates.
//   1 platinum = 10 gold = 100 electrum/... actually:
//   1 pp = 10 gp; 1 gp = 2 ep; 1 ep = 5 sp; 1 sp = 10 cp.
// In copper:
//   cp = 1, sp = 10, ep = 50, gp = 100, pp = 1000.
export type Coin = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';
export const COIN_TO_CP: Record<Coin, number> = {
  cp: 1, sp: 10, ep: 50, gp: 100, pp: 1000,
};
export const COIN_LABEL: Record<Coin, string> = {
  cp: 'copper', sp: 'silver', ep: 'electrum', gp: 'gold', pp: 'platinum',
};

export type CoinPurse = { cp: number; sp: number; ep: number; gp: number; pp: number };

export function emptyPurse(): CoinPurse {
  return { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
}

export function purseToCp(p: CoinPurse): number {
  return p.cp + p.sp * 10 + p.ep * 50 + p.gp * 100 + p.pp * 1000;
}

export function purseToGp(p: CoinPurse): number {
  return purseToCp(p) / 100;
}

// 50 coins = 1 lb in 5e regardless of denomination.
export function purseWeightLb(p: CoinPurse): number {
  const total = p.cp + p.sp + p.ep + p.gp + p.pp;
  return total / 50;
}

// Consolidate up: convert lower denominations into higher when possible.
// Skips electrum because most tables ignore it; flag controls.
export function consolidatePurse(p: CoinPurse, opts?: { keepElectrum?: boolean }): CoinPurse {
  const keepEp = opts?.keepElectrum ?? false;
  let cp = purseToCp(p);
  const out = emptyPurse();
  out.pp = Math.floor(cp / 1000); cp -= out.pp * 1000;
  out.gp = Math.floor(cp / 100);  cp -= out.gp * 100;
  if (keepEp) {
    out.ep = Math.floor(cp / 50); cp -= out.ep * 50;
  }
  out.sp = Math.floor(cp / 10);   cp -= out.sp * 10;
  out.cp = cp;
  return out;
}

// Container math. Capacity is volume in liters or weight in lb; we track
// both and report the binding constraint.
export type Container = {
  id: string;
  label: string;
  maxWeightLb: number;
  maxVolumeL: number;
  /** Self-weight of the empty container. */
  emptyWeightLb: number;
};

export const CONTAINER_PRESETS: Container[] = [
  { id: 'backpack',    label: 'Backpack',        maxWeightLb: 30,    maxVolumeL: 60, emptyWeightLb: 5 },
  { id: 'sack-s',      label: 'Sack (small)',    maxWeightLb: 30,    maxVolumeL: 30, emptyWeightLb: 0.5 },
  { id: 'sack-l',      label: 'Sack (large)',    maxWeightLb: 60,    maxVolumeL: 60, emptyWeightLb: 0.5 },
  { id: 'pouch',       label: 'Belt pouch',      maxWeightLb: 6,     maxVolumeL: 4,  emptyWeightLb: 1 },
  { id: 'chest',       label: 'Chest',           maxWeightLb: 300,   maxVolumeL: 120,emptyWeightLb: 25 },
  { id: 'barrel',      label: 'Barrel',          maxWeightLb: 300,   maxVolumeL: 120,emptyWeightLb: 70 },
  { id: 'bag-holding', label: 'Bag of Holding',  maxWeightLb: 500,   maxVolumeL: 240,emptyWeightLb: 15 },
  { id: 'handy-haver', label: 'Handy Haversack', maxWeightLb: 120,   maxVolumeL: 90, emptyWeightLb: 5 },
];

export type Item = {
  id: string;
  name: string;
  weightLb: number;
  volumeL?: number;
  quantity: number;
  containerId?: string;
};

export type ContainerStatus = {
  container: Container;
  itemsWeightLb: number;
  itemsVolumeL: number;
  /** Fraction of weight capacity used (>1 = overstuffed). */
  weightUsage: number;
  volumeUsage: number;
  overWeight: boolean;
  overVolume: boolean;
};

export function containerStatus(container: Container, items: Item[]): ContainerStatus {
  const mine = items.filter(it => it.containerId === container.id);
  const w = mine.reduce((s, it) => s + it.weightLb * it.quantity, 0);
  const v = mine.reduce((s, it) => s + (it.volumeL ?? 0) * it.quantity, 0);
  return {
    container,
    itemsWeightLb: w,
    itemsVolumeL: v,
    weightUsage: w / Math.max(0.01, container.maxWeightLb),
    volumeUsage: v / Math.max(0.01, container.maxVolumeL),
    overWeight: w > container.maxWeightLb,
    overVolume: v > container.maxVolumeL,
  };
}

// Total weight a creature is hauling: container empty-weights plus all items
// (regardless of which container holds them). Items without a container are
// "loose" and still count.
export function totalCarriedLb(items: Item[], containers: Container[]): number {
  const itemsW = items.reduce((s, it) => s + it.weightLb * it.quantity, 0);
  const cW = containers.reduce((s, c) => s + c.emptyWeightLb, 0);
  return itemsW + cW;
}
