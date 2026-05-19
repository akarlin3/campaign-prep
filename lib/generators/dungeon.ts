import { rollOn } from '@/lib/tables/roll';
import type { SeededRng } from './rng';
import {
  HAZARD_TABLE,
  INHABITANTS_BY_THEME_TIER,
  ROOM_CONTENT_KINDS,
  ROOM_DESCRIPTIONS_BY_KIND,
  ROOM_DRESSING,
  ROOM_NAME_NOUNS,
  SIZE_TO_ROOM_COUNT,
  THEME_NAME_PREFIXES,
  THEME_NAME_SUFFIXES,
  type DungeonChallengeTier,
  type DungeonSize,
  type DungeonTheme,
  type RoomKind,
} from './tables/dungeon-tables';
import type { DungeonResult, DungeonRoom } from './types';

function dungeonName(theme: DungeonTheme, rng: SeededRng): string {
  const prefix = rollOn(THEME_NAME_PREFIXES[theme], rng);
  const suffix = rollOn(THEME_NAME_SUFFIXES[theme], rng);
  return `${prefix} ${suffix}`;
}

function generateRooms(count: number, theme: DungeonTheme, tier: DungeonChallengeTier, rng: SeededRng): DungeonRoom[] {
  const rooms: DungeonRoom[] = [];
  const inhabitantPool = INHABITANTS_BY_THEME_TIER[theme][tier];
  for (let i = 1; i <= count; i++) {
    const totalWeight = ROOM_CONTENT_KINDS.reduce((s, k) => s + k.weight, 0);
    let r = rng.next() * totalWeight;
    let kind: RoomKind = 'empty';
    for (const k of ROOM_CONTENT_KINDS) {
      r -= k.weight;
      if (r < 0) { kind = k.value; break; }
    }
    let contents = rollOn(ROOM_DESCRIPTIONS_BY_KIND[kind], rng);
    if (kind === 'monster' && inhabitantPool && inhabitantPool.length) {
      contents = `${contents} (${rollOn(inhabitantPool, rng)})`;
    }
    rooms.push({
      index: i,
      name: `${rollOn(ROOM_NAME_NOUNS, rng)} ${i}`,
      contents,
      dressing: rollOn(ROOM_DRESSING, rng),
    });
  }
  return rooms;
}

export function generateDungeon(
  inputs: { size: DungeonSize; theme: DungeonTheme; challengeTier: DungeonChallengeTier },
  rng: SeededRng,
): DungeonResult {
  const count = SIZE_TO_ROOM_COUNT[inputs.size];
  const rooms = generateRooms(count, inputs.theme, inputs.challengeTier, rng);
  const hazardCount = rng.int(2, 4);
  const hazards: string[] = [];
  const usedHaz = new Set<string>();
  while (hazards.length < hazardCount) {
    const h = rollOn(HAZARD_TABLE, rng);
    if (usedHaz.has(h)) continue;
    usedHaz.add(h);
    hazards.push(h);
  }
  // Distinct inhabitants pulled from the same theme/tier pool.
  const pool = INHABITANTS_BY_THEME_TIER[inputs.theme][inputs.challengeTier];
  const inhabitants: string[] = [];
  const usedInh = new Set<string>();
  const wantedInh = Math.min(pool.length, rng.int(2, 4));
  while (inhabitants.length < wantedInh) {
    const e = rollOn(pool, rng);
    if (usedInh.has(e)) continue;
    usedInh.add(e);
    inhabitants.push(e);
  }
  return {
    kind: 'dungeon',
    id: `dungeon_${rng.seed.toString(16)}`,
    seed: rng.seed,
    inputs,
    name: dungeonName(inputs.theme, rng),
    details: {
      size: inputs.size,
      theme: inputs.theme,
      challengeTier: inputs.challengeTier,
      rooms,
      hazards,
      inhabitants,
    },
    enhanced: false,
  };
}
