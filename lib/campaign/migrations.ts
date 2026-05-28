// One-way migrations that upgrade legacy campaign `data` shapes to the current
// schema. Extracted from CampaignEditor so the logic has a single home and can
// be unit-tested in isolation. These run once when a campaign is first loaded
// into the editor; legacy keys are dropped after migration and their content is
// preserved inside the new shape.

import { type Character, emptyCharacter, normalizeCharacter } from '../character-schema';
import { mapParsedToPc } from '../pc/from-parser';
import { todayISO, type SessionLogEntry } from '../sessionLog';

/** Legacy body-based session log entry (pre-`sessionLogV2`). */
export type SessionLog = { id: string; title: string; date: string; body: string };

/** Stable id for session log entries; prefers `crypto.randomUUID` when available. */
export function makeLogId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// One-way migration: pcName/pcClass/pcBg/pcWant/pcFear/pcLove/pcFactions → characters[0].
// Legacy keys are dropped after migration; data is preserved inside the new character.
export function migrateCharacters(data: Record<string, any>): Record<string, any> {
  if (Array.isArray(data.characters)) {
    return { ...data, characters: (data.characters as unknown[]).map(normalizeCharacter) };
  }
  const { pcName, pcClass, pcBg, pcWant, pcFear, pcLove, pcFactions, ...rest } = data;
  const hasLegacy =
    pcName || pcClass || pcBg || pcWant || pcFear || pcLove ||
    (Array.isArray(pcFactions) && pcFactions.length > 0);
  if (!hasLegacy) return { ...rest, characters: [] };

  const seed = emptyCharacter();
  const factionTies = Array.isArray(pcFactions)
    ? (pcFactions as unknown[]).filter((s) => typeof s === 'string' && s).join(', ')
    : '';
  const migrated: Character = {
    ...seed,
    name: pcName || '',
    classLevel: pcClass || '',
    backstory: pcBg || '',
    ideals: pcWant || '',
    flaws: pcFear || '',
    bonds: pcLove || '',
    notes: factionTies ? `Faction Ties: ${factionTies}` : '',
  };
  return { ...rest, characters: [migrated] };
}

/**
 * Run {@link migrateCharacters}, then fold any resulting legacy `characters`
 * into the canonical `pcs` list (deduping by id or trimmed name) and clear
 * `characters`.
 */
export function migrateCharactersAndPcs(data: Record<string, any>): Record<string, any> {
  const migrated = migrateCharacters(data);
  if (Array.isArray(migrated.characters) && migrated.characters.length > 0) {
    const existingPcs = Array.isArray(migrated.pcs) ? migrated.pcs : [];
    const mapped = migrated.characters.map((c: any) => {
      const pc = mapParsedToPc(c);
      if (c.ownership) {
        pc.ownership = {
          ownerType: c.ownership.ownerType,
          playerSlotId: c.ownership.playerSlotId,
        };
      }
      return pc;
    });
    const nextPcs = [...existingPcs];
    for (const newPc of mapped) {
      if (!nextPcs.some(p => p.id === newPc.id || (p.name && p.name.trim() && p.name === newPc.name))) {
        nextPcs.push(newPc);
      }
    }
    migrated.pcs = nextPcs;
    migrated.characters = [];
  }
  return migrated;
}

/**
 * Fold legacy `logCurrent` text and `sessionLogs` entries into the current
 * `sessionLogV2` shape, preserving any existing v2 entries and deduping by id.
 */
export function migrateSessionLogs(
  data: Record<string, any>,
): { initialState: Record<string, any>; initialOpenId: string | null } {
  const { logCurrent, ...rest } = data;

  let legacyLogs: any[] = [];
  if (Array.isArray(data.sessionLogs)) {
    legacyLogs = data.sessionLogs;
  }
  let v2Logs: any[] = [];
  if (Array.isArray(data.sessionLogV2)) {
    v2Logs = data.sessionLogV2;
  }

  const existing = typeof logCurrent === 'string' ? logCurrent.trim() : '';
  if (existing) {
    const id = makeLogId();
    const migrated: SessionLog = { id, title: 'Session 1', date: todayISO(), body: logCurrent };
    legacyLogs = [migrated, ...legacyLogs];
  }

  if (legacyLogs.length > 0) {
    const nextV2 = [...v2Logs];
    const sortedLegacy = [...legacyLogs].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    sortedLegacy.forEach((legacy) => {
      const exists = v2Logs.some(v2 => v2.id === legacy.id);
      if (!exists) {
        const parsedDate = legacy.date ? Date.parse(legacy.date) : Date.now();
        const time = isNaN(parsedDate) ? Date.now() : parsedDate;
        const entry: SessionLogEntry = {
          id: legacy.id || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          number: nextV2.length + 1,
          date: legacy.date || todayISO(),
          startedAt: time,
          endedAt: time,
          title: legacy.title || `Session ${nextV2.length + 1}`,
          recap: legacy.body || '',
          events: [],
          secretsRevealed: [],
          scenesUsed: [],
          goalUpdates: [],
        };
        nextV2.push(entry);
      }
    });

    return {
      initialState: {
        ...rest,
        sessionLogV2: nextV2,
        sessionLogs: [],
      },
      initialOpenId: null,
    };
  }

  return { initialState: { ...rest, sessionLogV2: v2Logs }, initialOpenId: null };
}
