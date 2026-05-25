// Builds the redacted per-slot payload that the GM browser publishes to
// playerShares/{shareToken}/slots/{slotId}. This is the only thing players ever
// read, so redaction correctness here IS the security boundary for field-level
// privacy. Uses resolveVisibility for every decision.

import { resolveVisibility } from './resolveVisibility';
import {
  PLAYER_ENTITY_TYPES,
  type EntityVisibility,
  type PlayerConfig,
  type PlayerEntityType,
  type ShareMeta,
  type SlotProjection,
} from './types';

type AnyData = Record<string, any>;

// GM-only fields on modern session-log entries (lib/sessionLog.ts) that must
// never reach players, regardless of entry visibility.
const SESSION_LOG_GM_FIELDS = new Set([
  'events',
  'secretsRevealed',
  'scenesUsed',
  'goalUpdates',
]);

// Fields on an entity that are structural/non-content and should never be
// surfaced as player-visible content (but `id` is always kept for keying).
const STRUCTURAL_FIELDS = new Set([
  'isSidekick', 'sidekickClass', 'sidekickSpellList', 'sidekickBase',
  'sidekickLevel', 'gestalt', 'pointBuy', 'isPublic',
]);

function entityFields(entity: AnyData): string[] {
  return Object.keys(entity).filter((k) => k !== 'id' && !STRUCTURAL_FIELDS.has(k));
}

function redactEntity(
  entity: AnyData,
  entityType: PlayerEntityType,
  config: PlayerConfig,
  slotId: string,
): Record<string, unknown> | null {
  const visibility: EntityVisibility | undefined =
    config.entityVisibility?.[entityType]?.[entity.id];
  const { entityVisible, visibleFields } = resolveVisibility({
    entityType,
    visibility,
    slotId,
    defaults: config.fieldDefaults,
    fields: entityFields(entity),
  });
  if (!entityVisible) return null;
  const out: Record<string, unknown> = { id: entity.id };
  for (const field of visibleFields) out[field] = entity[field];
  return out;
}

function redactSessionLogEntry(entry: AnyData): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (!SESSION_LOG_GM_FIELDS.has(k)) out[k] = v;
  }
  return out;
}

export function buildShareMeta(campaignId: string, data: AnyData, campaignName: string): ShareMeta {
  const config: PlayerConfig = data.player;
  return {
    campaignId,
    campaignName,
    tokenVersion: config.tokenVersion,
    roster: config.roster ?? [],
  };
}

export function buildSlotProjection(
  data: AnyData,
  campaignName: string,
  slotId: string,
  nowMs: number = Date.now(),
): SlotProjection {
  const config: PlayerConfig = data.player;
  const entities: SlotProjection['entities'] = {};

  for (const type of PLAYER_ENTITY_TYPES) {
    const arr = data[type];
    if (!Array.isArray(arr)) continue;
    const redacted: Array<Record<string, unknown>> = [];
    for (const e of arr) {
      if (!e || typeof e !== 'object' || !e.id) continue;
      const r = redactEntity(e, type, config, slotId);
      if (r) redacted.push(r);
    }
    if (redacted.length > 0) entities[type] = redacted;
  }

  // Handouts: a single string gated by its own visibility record.
  let handouts: string | null = null;
  const handoutVis = config.handouts;
  if (typeof data.handouts === 'string' && data.handouts.trim()) {
    const visible = handoutVis?.mode === 'party'
      || (handoutVis?.mode === 'custom' && (handoutVis.allowedSlotIds ?? []).includes(slotId));
    if (visible) handouts = data.handouts;
  }

  // Session log: include entries whose visibility allows this slot (legacy
  // entries with no visibility default to party), with GM-only fields stripped.
  const sessionLog: Array<Record<string, unknown>> = [];
  const logs = Array.isArray(data.sessionLogs) ? data.sessionLogs : [];
  for (const entry of logs) {
    if (!entry || typeof entry !== 'object') continue;
    const vis: EntityVisibility | undefined = entry.visibility;
    const visible = !vis
      ? false // entries must be explicitly shared (see Checkpoint 3)
      : vis.mode === 'party'
        || (vis.mode === 'custom' && (vis.allowedSlotIds ?? []).includes(slotId));
    if (visible) sessionLog.push(redactSessionLogEntry(entry));
  }

  return {
    campaignName,
    tokenVersion: config.tokenVersion,
    slotId,
    entities,
    handouts,
    sessionLog,
    updatedAtMs: nowMs,
  };
}
