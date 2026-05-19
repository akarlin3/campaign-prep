import { rollOn } from '@/lib/tables/roll';
import type { SeededRng } from './rng';
import {
  ECONOMIES,
  GOVERNMENT_TYPES,
  HOOKS,
  NAME_PREFIXES,
  NAME_SUFFIXES,
  NOTABLE_ROLES,
  SIZE_POPULATION_BANDS,
} from './tables/settlement-tables';
import { OWNER_FIRSTNAMES, OWNER_SURNAMES } from './tables/shop-tables';
import type { NotableRef, SettlementResult, SettlementSizeClass } from './types';

function settlementName(rng: SeededRng): string {
  const prefix = rollOn(NAME_PREFIXES, rng);
  const suffix = rollOn(NAME_SUFFIXES, rng);
  // Some suffixes look better capitalised separately:
  const joined = ['bridge', 'cross', 'field', 'gate', 'hall', 'hill', 'lake', 'mill', 'moor', 'pool', 'reach', 'ridge', 'shore', 'water', 'well', 'wood'].includes(suffix)
    ? `${prefix}${suffix}`
    : `${prefix}${suffix}`;
  return joined.replace(/^./, (c) => c.toUpperCase());
}

function buildNotables(count: number, rng: SeededRng): NotableRef[] {
  const out: NotableRef[] = [];
  const seenRoles = new Set<string>();
  let safety = count * 5;
  while (out.length < count && safety-- > 0) {
    const role = rollOn(NOTABLE_ROLES, rng);
    if (seenRoles.has(role)) continue;
    seenRoles.add(role);
    const first = rollOn(OWNER_FIRSTNAMES, rng);
    const last = rollOn(OWNER_SURNAMES, rng);
    out.push({ name: `${first} ${last}`, role });
  }
  return out;
}

export function generateSettlement(
  inputs: { sizeClass: SettlementSizeClass; region?: string; government?: string },
  rng: SeededRng,
): SettlementResult {
  const band = SIZE_POPULATION_BANDS[inputs.sizeClass];
  const population = rng.int(band.min, band.max);
  const government = inputs.government?.trim() && inputs.government !== 'random'
    ? inputs.government
    : rollOn(GOVERNMENT_TYPES, rng);
  const economy = rollOn(ECONOMIES, rng);
  const notables = buildNotables(band.notables + rng.int(0, 1), rng);

  const hookCount = rng.int(2, 3);
  const hooks: string[] = [];
  const used = new Set<string>();
  while (hooks.length < hookCount) {
    const h = rollOn(HOOKS, rng);
    if (used.has(h)) continue;
    used.add(h);
    hooks.push(h);
  }

  return {
    kind: 'settlement',
    id: `settlement_${rng.seed.toString(16)}`,
    seed: rng.seed,
    inputs,
    name: settlementName(rng),
    details: {
      population,
      sizeClass: inputs.sizeClass,
      government,
      economy,
      notables,
      hooks,
      region: inputs.region?.trim() || undefined,
    },
    enhanced: false,
  };
}
