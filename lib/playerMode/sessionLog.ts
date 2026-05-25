// Player-facing narration feed. Kept in its own `data.playerLog` array so it
// doesn't collide with the GM's existing legacy/modern `data.sessionLogs`
// (which carry GM-only events/secrets). Posting an entry can auto-reveal the
// entities it mentions — reveals are sticky (never downgraded).

import type {
  EntityVisibility, PlayerConfig, PlayerEntityType,
} from './types';

export type Mention = {
  entityType: PlayerEntityType;
  entityId: string;
  label: string;
};

export type PlayerLogEntry = {
  id: string;
  text: string;
  mentions: Mention[];
  visibility: EntityVisibility;
  authorRef: 'gm' | string;
  postedAtMs: number;
};

export function makeLogEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function unionSlots(a: string[] | undefined, b: string[] | undefined): string[] {
  return [...new Set([...(a ?? []), ...(b ?? [])])];
}

// Compute the new visibility for one mentioned entity given the entry's
// visibility. Sticky upgrade only — never narrows existing access.
export function upgradeForMention(
  cur: EntityVisibility | undefined,
  entryVis: EntityVisibility,
): EntityVisibility | undefined {
  if (entryVis.mode === 'party') {
    if (!cur || cur.mode === 'private') return { ...(cur ?? {}), mode: 'party', allowedSlotIds: undefined };
    return cur; // already party or custom — party doesn't narrow, leave as-is
  }
  if (entryVis.mode === 'custom') {
    const slots = entryVis.allowedSlotIds ?? [];
    if (!cur || cur.mode === 'private') {
      return { mode: 'custom', allowedSlotIds: [...slots], fieldOverrides: cur?.fieldOverrides };
    }
    if (cur.mode === 'custom') {
      return { ...cur, allowedSlotIds: unionSlots(cur.allowedSlotIds, slots) };
    }
    return cur; // party is broader than custom — leave
  }
  return cur;
}

// Apply all of an entry's mention reveals to a player config, returning a new
// config. Pure.
export function applyNarrationReveal(
  config: PlayerConfig,
  mentions: Mention[],
  entryVis: EntityVisibility,
): PlayerConfig {
  if (mentions.length === 0) return config;
  const ev = { ...(config.entityVisibility ?? {}) };
  for (const m of mentions) {
    const bucket = { ...(ev[m.entityType] ?? {}) };
    const next = upgradeForMention(bucket[m.entityId], entryVis);
    if (next && next.mode !== 'private') bucket[m.entityId] = next;
    ev[m.entityType] = bucket;
  }
  return { ...config, entityVisibility: ev };
}
