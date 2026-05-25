// Roster mutations that must also scrub a slot out of every visibility record,
// so a removed player can't linger in custom allow-lists. Pure + tested; the
// publisher's staleSlotIds() handles deleting the orphaned slot projection doc
// on the next publish.

import type { EntityVisibility, PlayerConfig } from './types';

function scrubSlotFromVisibility(vis: EntityVisibility, slotId: string): EntityVisibility {
  if (!vis.allowedSlotIds) return vis;
  return { ...vis, allowedSlotIds: vis.allowedSlotIds.filter((s) => s !== slotId) };
}

export function removeSlotFromConfig(config: PlayerConfig, slotId: string): PlayerConfig {
  const ev: PlayerConfig['entityVisibility'] = {};
  for (const [type, bucket] of Object.entries(config.entityVisibility ?? {})) {
    const next: Record<string, EntityVisibility> = {};
    for (const [id, vis] of Object.entries(bucket)) {
      next[id] = scrubSlotFromVisibility(vis, slotId);
    }
    ev[type as keyof PlayerConfig['entityVisibility']] = next;
  }
  const handouts = config.handouts ? scrubSlotFromVisibility(config.handouts, slotId) : config.handouts;
  return {
    ...config,
    roster: (config.roster ?? []).filter((s) => s.slotId !== slotId),
    entityVisibility: ev,
    handouts,
  };
}
