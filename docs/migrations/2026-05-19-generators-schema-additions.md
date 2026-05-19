# Generators Suite — schema additions

_Migration note for: branch `claude/generators-suite-audit-AykfZ`, Checkpoint 2._

## TL;DR

All changes are **additive**. No existing campaign data needs migration. No
destructive runtime migration script is required. Existing campaign docs
without the new fields continue to render exactly as before.

## What's new on `campaigns/{id}.data`

| Key | Pre-existing shape | New shape (back-compatible) |
|---|---|---|
| `items` | `string[]` (free-text item ideas) | **Union**: `(string \| StructuredItem)[]`. Existing string entries keep rendering as today via a `typeof === 'string'` check. New generator outputs append `StructuredItem` objects. |
| `locations` | `LegacyLocation[]` (`{ name, type, aspects: [string, string, string], factions }`) | **Union**: `(LegacyLocation \| StructuredLocation)[]`. `StructuredLocation` carries an extra `id`, `subtype`, optional `details`, and `source`. Renderers fall back to legacy reads when fields are absent. |
| `npcs` | `LegacyNpc[]` (`{ name, type, faction, archetype, goal, method, appearance, abilities, talent, mannerism, interactions, knowledge, ideal, bond, flaw }`) | **Union**: `(LegacyNpc \| StructuredNpc)[]`. `StructuredNpc` adds `id`, `tier: "minor" \| "full"`, optional `descriptor`, and `source`. Existing NPCs are treated as `tier: "full"` by default. |
| `generationsHistory` | _did not exist_ | `GenerationHistoryEntry[]`, max 20, prepend-on-save. Powers the unified "Recent Generations" surface. |

The full TypeScript shapes are in `lib/generators/types.ts`.

## Naming-collision notes

- `NPC.archetype` already exists in the legacy schema as a free-text
  **villain-archetype descriptor** (e.g. "Cult Leader", "Crime Boss"),
  sourced from `inspirationTables.villainArchetypes`. The new minor/full
  distinction uses **`tier`** instead. Do not reuse `archetype` for the
  discriminator.
- `Location.type` is already a free-text select from `lib/locations.ts`
  (`"Tavern / Inn"`, `"Dungeon"`, `"Village"`, etc.). The new
  **`subtype`** field (`tavern | dungeon | settlement | wilderness | shop |
  other`) is the canonical discriminator and is populated by the new
  generators. Legacy locations without `subtype` are treated as
  `"other"`.

## How writes happen

Per the audit (`docs/audits/generators-suite-audit.md` 1b), entities are
not in subcollections — they are arrays inside the single `data` blob,
autosynced every 1.5 seconds by `updateCampaign`. The save pipeline
(`lib/generators/save.ts`) is a **pure function** that takes the current
`data` + a `GeneratorResult` and returns a patched `data`. Callers patch
local state via the editor's `setVal('data', patched)`; autosync flushes
the result. This avoids racing the local debounced state that a direct
`updateDoc` write would risk.

## Firestore rules

No rule changes required. Everything still routes through
`campaigns/{id}.data` and is authorised by the existing rule that checks
`resource.data.userId == request.auth.uid`.

## Read-side defaults

- `StructuredItem` consumers should default `attunement` to `false`,
  `description` to empty string. Legacy string entries render as
  `{ name: <string>, source: 'manual' }` for display purposes.
- `StructuredLocation` consumers should default `subtype` to `'other'`
  when reading from a legacy location, and skip the `details` panel
  entirely when undefined.
- `StructuredNpc` consumers should default `tier` to `'full'` for legacy
  NPCs (since they were authored by hand, not by a minor-NPC generator).

## Forward compatibility

These additions reserve the field names without committing to any
particular UI for them today. The legacy editors in `CampaignEditor.tsx`
continue to ignore the new fields. The Generators Suite UI (Checkpoint 10)
is the first to read them.
