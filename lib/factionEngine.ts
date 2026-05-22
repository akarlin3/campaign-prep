// Living-world / faction simulation engine.
//
// Each campaign owns a small set of factions, territories, and resources.
// Between sessions, the DM presses "Advance tick" (or auto-runs N ticks)
// and the engine resolves actions deterministically given the current
// state. This is a *grand-strategy lite* layer: it produces narrative
// hooks ("the Iron Hand's troops marched into Westhollow") rather than
// fine-grained mechanics. The DM is always the final arbiter — the engine
// reports what would happen, and the DM accepts or vetoes per tick.

export type FactionId = string;
export type TerritoryId = string;

export type Faction = {
  id: FactionId;
  name: string;
  archetype: string;
  /** Color hex for graph rendering. */
  color?: string;
  /** Aggression 0–10: how often this faction will initiate. */
  aggression: number;
  /** Reach 0–10: scaling factor on contested influence rolls. */
  reach: number;
  /** Wealth 0–10: gold/resource regen, recruitment, bribes. */
  wealth: number;
  /** Stockpiled influence — spent on actions. */
  influence: number;
  /** Free-form goals; the engine considers the FIRST goal each tick. */
  goals: string[];
};

export type Territory = {
  id: TerritoryId;
  name: string;
  /** Who currently controls it. Null = contested / neutral. */
  controllerId: FactionId | null;
  /** Strategic value 1–5; multiplies wealth gain per tick. */
  value: number;
  /** Neighbor territory IDs for adjacency-based moves. */
  neighbors: TerritoryId[];
};

export type Relationship = {
  /** -10 (blood enemies) to +10 (sworn allies). */
  stance: number;
  /** Long-form notes (debts, oaths). */
  note?: string;
};

/** Sparse pair map keyed by `${a}|${b}` with a < b for canonical form. */
export type RelationshipMap = Record<string, Relationship>;

export function relKey(a: FactionId, b: FactionId): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export function getRelationship(map: RelationshipMap, a: FactionId, b: FactionId): Relationship {
  return map[relKey(a, b)] ?? { stance: 0 };
}

export function setRelationship(map: RelationshipMap, a: FactionId, b: FactionId, r: Relationship): RelationshipMap {
  if (a === b) return map;
  return { ...map, [relKey(a, b)]: r };
}

export type FactionWorld = {
  factions: Faction[];
  territories: Territory[];
  relationships: RelationshipMap;
  tick: number;
  /** Append-only log of resolved tick events. */
  log: TickEvent[];
};

export type TickEvent = {
  tick: number;
  factionId: FactionId;
  /** What kind of move resolved. */
  kind: 'expand' | 'consolidate' | 'raid' | 'diplomacy' | 'recruit' | 'rest';
  summary: string;
  /** Optional territory touched. */
  territoryId?: TerritoryId;
};

export function emptyWorld(): FactionWorld {
  return { factions: [], territories: [], relationships: {}, tick: 0, log: [] };
}

// Deterministic PRNG so the engine is reproducible across sessions when the
// seed (campaign id + tick) is the same. Mulberry32 — small, plenty for
// this use case.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Compute "power" for a faction — influences contested rolls. */
export function factionPower(f: Faction, controlled: number): number {
  return f.reach + f.wealth + controlled * 2;
}

/** Decide what action a faction will attempt this tick. */
function chooseAction(
  f: Faction,
  world: FactionWorld,
  rng: () => number,
): TickEvent['kind'] {
  // If broke or low influence, rest or recruit.
  if (f.influence < 2) return rng() < 0.5 ? 'recruit' : 'rest';
  // Aggression-weighted action distribution.
  const roll = rng() * 10;
  if (roll < f.aggression * 0.6) return 'raid';
  if (roll < f.aggression) return 'expand';
  if (roll < 7) return 'diplomacy';
  return 'consolidate';
}

function pickEnemy(f: Faction, world: FactionWorld, rng: () => number): Faction | null {
  const others = world.factions.filter(x => x.id !== f.id);
  if (others.length === 0) return null;
  const scored = others.map(o => {
    const r = getRelationship(world.relationships, f.id, o.id).stance;
    // Lower stance => more likely to be targeted. Add small randomness.
    const hostility = (5 - r) + rng() * 3;
    return { o, hostility };
  });
  scored.sort((a, b) => b.hostility - a.hostility);
  return scored[0]?.o ?? null;
}

function controlledTerritories(world: FactionWorld, id: FactionId): Territory[] {
  return world.territories.filter(t => t.controllerId === id);
}

function frontierTerritories(world: FactionWorld, id: FactionId): Territory[] {
  // Territories not owned by `id` but adjacent to one that is.
  const own = new Set(controlledTerritories(world, id).map(t => t.id));
  return world.territories.filter(t =>
    t.controllerId !== id && t.neighbors.some(n => own.has(n)),
  );
}

/**
 * Run a single tick. Returns the new world state.
 *
 * The seed is derived from `(campaignId + tick)` so re-running tick N from
 * the same state yields the same outcome — the DM can preview, undo, retry.
 */
export function runTick(world: FactionWorld, seedBase: string): FactionWorld {
  const tick = world.tick + 1;
  const rng = mulberry32(hashString(`${seedBase}|${tick}`));
  let next: FactionWorld = {
    ...world,
    tick,
    factions: world.factions.map(f => ({ ...f })),
    territories: world.territories.map(t => ({ ...t })),
    relationships: { ...world.relationships },
    log: [...world.log],
  };

  // Income phase: gain influence proportional to controlled value + wealth.
  for (const f of next.factions) {
    const owned = controlledTerritories(next, f.id);
    const value = owned.reduce((s, t) => s + t.value, 0);
    f.influence += Math.max(1, Math.round((value + f.wealth) / 2));
  }

  // Action phase: factions act in randomized order to avoid first-mover bias.
  const order = [...next.factions].sort(() => rng() - 0.5);
  for (const f of order) {
    const kind = chooseAction(f, next, rng);
    const event: TickEvent = { tick, factionId: f.id, kind, summary: '' };
    switch (kind) {
      case 'rest': {
        f.influence += 2;
        event.summary = `${f.name} pulls back to lick its wounds (+2 influence).`;
        break;
      }
      case 'recruit': {
        const cost = 1;
        if (f.influence >= cost) {
          f.influence -= cost;
          f.reach = Math.min(10, f.reach + 1);
          event.summary = `${f.name} swells its ranks (reach +1).`;
        } else {
          event.summary = `${f.name} fails to recruit — coffers empty.`;
        }
        break;
      }
      case 'diplomacy': {
        const ally = pickAlly(f, next, rng);
        if (!ally) { event.summary = `${f.name} has no one left to court.`; break; }
        const rel = getRelationship(next.relationships, f.id, ally.id);
        const newStance = Math.min(10, rel.stance + 1);
        next.relationships = setRelationship(next.relationships, f.id, ally.id, { ...rel, stance: newStance });
        event.summary = `${f.name} parleys with ${ally.name} (stance ${rel.stance} → ${newStance}).`;
        break;
      }
      case 'expand': {
        const frontier = frontierTerritories(next, f.id);
        if (frontier.length === 0) {
          // No frontier: claim a random unowned territory if any exists.
          const unowned = next.territories.filter(t => t.controllerId === null);
          if (unowned.length > 0 && f.influence >= 3) {
            const target = unowned[Math.floor(rng() * unowned.length)];
            target.controllerId = f.id;
            f.influence -= 3;
            event.kind = 'expand';
            event.territoryId = target.id;
            event.summary = `${f.name} plants a flag in unclaimed ${target.name}.`;
          } else {
            event.summary = `${f.name} probes its borders but finds nothing to take.`;
          }
          break;
        }
        const target = frontier[Math.floor(rng() * frontier.length)];
        const defender = target.controllerId ? next.factions.find(x => x.id === target.controllerId) ?? null : null;
        const cost = 3;
        if (f.influence < cost) { event.summary = `${f.name} cannot afford the campaign for ${target.name}.`; break; }
        f.influence -= cost;
        const attackerPower = factionPower(f, controlledTerritories(next, f.id).length) + rng() * 4;
        const defenderPower = defender
          ? factionPower(defender, controlledTerritories(next, defender.id).length) + rng() * 4
          : rng() * 3; // neutral garrison
        if (attackerPower > defenderPower) {
          target.controllerId = f.id;
          event.kind = 'expand';
          event.territoryId = target.id;
          if (defender) {
            // Worsen relationship.
            const rel = getRelationship(next.relationships, f.id, defender.id);
            const newStance = Math.max(-10, rel.stance - 2);
            next.relationships = setRelationship(next.relationships, f.id, defender.id, { ...rel, stance: newStance });
            event.summary = `${f.name} seizes ${target.name} from ${defender.name}.`;
          } else {
            event.summary = `${f.name} claims ${target.name} from neutral hands.`;
          }
        } else {
          event.summary = `${f.name}'s push into ${target.name} is repulsed.`;
        }
        break;
      }
      case 'raid': {
        const enemy = pickEnemy(f, next, rng);
        if (!enemy) { event.summary = `${f.name} finds no foe worth striking.`; break; }
        const enemyTerritories = controlledTerritories(next, enemy.id);
        if (enemyTerritories.length === 0) { event.summary = `${f.name} has no target — ${enemy.name} holds no land.`; break; }
        const target = enemyTerritories[Math.floor(rng() * enemyTerritories.length)];
        const cost = 2;
        if (f.influence < cost) { event.summary = `${f.name} lacks the strength to raid ${enemy.name}.`; break; }
        f.influence -= cost;
        f.wealth = Math.min(10, f.wealth + 1);
        enemy.wealth = Math.max(0, enemy.wealth - 1);
        const rel = getRelationship(next.relationships, f.id, enemy.id);
        const newStance = Math.max(-10, rel.stance - 1);
        next.relationships = setRelationship(next.relationships, f.id, enemy.id, { ...rel, stance: newStance });
        event.kind = 'raid';
        event.territoryId = target.id;
        event.summary = `${f.name} raids ${target.name} (held by ${enemy.name}) — gold flows, blood spills.`;
        break;
      }
      case 'consolidate':
      default: {
        f.influence += 3;
        f.wealth = Math.min(10, f.wealth + 1);
        event.summary = `${f.name} consolidates holdings (+3 influence, +1 wealth).`;
        break;
      }
    }
    next.log.push(event);
  }

  // Cap influence so it doesn't snowball unboundedly.
  for (const f of next.factions) {
    f.influence = Math.min(30, Math.max(0, f.influence));
  }

  return next;
}

function pickAlly(f: Faction, world: FactionWorld, rng: () => number): Faction | null {
  const others = world.factions.filter(x => x.id !== f.id);
  if (others.length === 0) return null;
  const scored = others.map(o => {
    const r = getRelationship(world.relationships, f.id, o.id).stance;
    const affinity = (r + 5) + rng() * 2;
    return { o, affinity };
  });
  scored.sort((a, b) => b.affinity - a.affinity);
  return scored[0]?.o ?? null;
}

export function runTicks(world: FactionWorld, count: number, seedBase: string): FactionWorld {
  let w = world;
  for (let i = 0; i < count; i++) {
    w = runTick(w, seedBase);
  }
  return w;
}
