// Phase 3 session log records: rich entries saved when a session ends via
// the finalizer. Kept separate from the legacy `sessionLogs` array (which
// the Track tab still uses) so neither side breaks.

import type { ChangeEvent } from './sessionEvents';
import type { Character } from './character-schema';
import { CR_TO_XP } from './encounterMath';

export type GoalUpdate = {
  goal: string;
  from: string;
  to: string;
};

export type LinkedPrepItem = {
  id: string; // The original prep item ID
  type: 'npc' | 'encounter' | 'loot' | 'location';
  snapshotName: string; // Static snapshot of name/title
  snapshotXP?: number; // Static snapshot of XP (for encounters)
  snapshotLoot?: string; // Static snapshot of loot description/text (for loot)
};

export type SessionLogEntry = {
  id: string;
  number: number;
  date: string;
  startedAt: number;
  endedAt: number;
  title?: string;
  recap: string;
  xpAwarded?: number;
  events: ChangeEvent[];
  secretsRevealed: string[];
  scenesUsed: string[];
  goalUpdates: GoalUpdate[];
  pinned?: boolean;
  linkedPrepItems?: LinkedPrepItem[];
};

export function parseMonsterXP(monsterStr: string): number {
  if (!monsterStr) return 0;
  const match = monsterStr.match(/(?:cr\s*|challenge\s*rating\s*|cr:\s*)(\d+(?:\/\d+)?)/i);
  if (match && match[1]) {
    const cr = match[1];
    return CR_TO_XP[cr] || 0;
  }
  return 0;
}

export function parseMonsterName(monsterStr: string): string {
  if (!monsterStr) return 'Unnamed Encounter';
  const parts = monsterStr.split(/(?:\s*—\s*|\s*,\s*|\s*·\s*)/);
  if (parts.length > 0) return parts[0].trim();
  return monsterStr.trim();
}

export function recalculatePartyState(
  entries: SessionLogEntry[],
  characters: Character[]
): {
  partyXP: number;
  partyInventory: string[];
  updatedCharacters: Character[];
} {
  const partyXP = entries.reduce((sum, entry) => {
    const basicXP = entry.xpAwarded || 0;
    const encounterXP = entry.linkedPrepItems
      ?.filter(item => item.type === 'encounter')
      .reduce((esum, e) => esum + (e.snapshotXP || 0), 0) || 0;
    return sum + basicXP + encounterXP;
  }, 0);

  const partyInventory = entries.reduce<string[]>((acc, entry) => {
    const lootItems = entry.linkedPrepItems
      ?.filter(item => item.type === 'loot')
      .map(item => item.snapshotLoot || item.snapshotName) || [];
    for (const item of lootItems) {
      if (item && !acc.includes(item)) {
        acc.push(item);
      }
    }
    return acc;
  }, []);

  const updatedCharacters = characters.map(c => ({
    ...c,
    experience: String(partyXP),
  }));

  return {
    partyXP,
    partyInventory,
    updatedCharacters,
  };
}

export function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return '0m';
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nextSessionNumber(existing: SessionLogEntry[]): number {
  if (existing.length === 0) return 1;
  return Math.max(...existing.map(e => e.number || 0)) + 1;
}

export function summarizeEvents(events: ChangeEvent[]): { kept: number; dismissed: number; starred: number } {
  let kept = 0, dismissed = 0, starred = 0;
  for (const e of events) {
    if (e.dismissed) dismissed++;
    else kept++;
    if (e.starred) starred++;
  }
  return { kept, dismissed, starred };
}
