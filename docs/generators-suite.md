# Generators Suite — user-facing reference

The **Generators** tab in the campaign workspace hosts deterministic
table-based generators that produce useful output without any AI calls,
plus an optional Pro-gated **Enhance with AI** step that adds narrative
flavour on top of the deterministic roll.

All seven new generators ship with original tables — none of the entries
are copied from the DMG, PHB, or any other non-SRD source. The two
existing Claude-driven generators (Names, Locations) are re-homed here
alongside the new ones.

## How it works

- **Generate** — rolls a fresh result using a seeded RNG. The seed is
  shown in the panel header so a result is reproducible from its seed.
- **Reroll** — generates a new result with a new seed, replacing the
  current one.
- **Save to campaign** — appends the right structured entities to your
  campaign (`Item`, `Location`, `NPC`, or some combination) and adds an
  entry to **Recent Generations**. Save is undone only by editing the
  campaign manually; it is not a draft.
- **Enhance with AI** — Pro feature. Sends the result to Claude with a
  per-generator prompt that adds prose without rewriting the
  deterministic data (e.g. names of magic items are never renamed; only
  flavour notes are added). Non-Pro users see a "Pro" badge instead.
- **Recent Generations** — the last 20 generations across all generators
  (per campaign), persisted in Firestore via the normal 1.5 s autosync.
  Includes reroll-by-kind and inspect-to-top actions.

## Keyboard shortcuts

When focus is not in an input/select/textarea:

| Key | Action |
|---|---|
| `G` | Focus the Generators sidebar |
| `R` | Reroll the current result (or trigger Generate if none) |
| `S` | Save the current result to the campaign |
| `E` | Enhance the current result with AI (Pro only) |

## The seven new generators

### Treasure Hoards

Roll coins, gems, art objects, and magic items by challenge tier and
hoard type (`Individual Treasure` is coins-only; `Treasure Hoard` adds
gems / art / magic items). Saves a single summary `Item` plus one
structured `Item` per magic item, all tagged
`source: "generator:treasure-hoard"`.

### Trinkets

Roll 1–10 distinct trinkets from an original 100-entry table. Saves each
as an `Item` with `category: "trinket"`, `rarity: "mundane"`. Pro
enhance adds a one-sentence hook per trinket.

### Mundane Shops

Roll a small-town shop by type (general store, smith, alchemist,
fletcher, herbalist, scribe, tailor, stable) and settlement size.
Inventory is filtered by settlement size's availability tier and
prices are scaled by the size's scarcity multiplier. Saves a `Location`
(`subtype: shop`) with structured `ShopDetails` plus a minor `NPC` for
the owner. Pro enhance rewrites the owner descriptor, adds two flavour
items, and writes a rumor.

### Magic Item Shops

Roll a magic shop by archetype (curio shop, hedge wizard, black market,
temple). Inventory filtered by your selected max rarity AND a settlement
scarcity cap (legendary items only appear in metropolises, etc.).
Per-archetype price multiplier. Pro enhance adds a "the seller will
only part with this if…" constraint per item.

### Taverns

Roll a tavern: name, atmosphere, full menu (food / drink / lodging)
priced to settlement size and vibe modifier, 3–6 patron stubs, 2–4
templated rumors, and an owner. Saves a `Location` (`subtype:
tavern`) with full `TavernDetails`, plus minor `NPC` records for the
owner and each patron.

### Dungeons

Roll a dungeon by size (5 / 10 / 20 / 40 rooms), theme (ruin, lair,
tomb, stronghold, temple, cave, sewer), and challenge tier. Each room
gets contents from a weighted table (empty / monster / trap / hazard /
treasure / feature / puzzle) plus a dressing detail. Inhabitants pulled
from theme- and tier-keyed pools. Save creates a single `Location`
(`subtype: dungeon`); rooms live inside `details.rooms`, not as
separate locations. Pro enhance writes a one-paragraph hook and vivid
descriptions for three interesting rooms.

### Settlements

Roll a settlement by size class (thorp → metropolis). Population falls
within the size band; government is rolled or user-selected; economy,
notable NPCs, and 2–3 hooks are rolled. Saves a `Location`
(`subtype: settlement`) plus minor `NPC` records for each notable.
Pro enhance writes a 3-sentence "current situation" paragraph weaving
the hooks together.

## Source / licensing

All seven new generators ship with original tables authored for this
project. SRD 5.1 (CC-BY-4.0) does not include the DMG treasure hoard
tables, the PHB d100 trinket table, or any of the dungeon / settlement
content — none of those are referenced. SRD 5.1 equipment is **not**
copied verbatim either; the mundane shop inventory is original prose
with original pricing. Where generic creature archetype names (e.g.
"skeleton", "goblin", "ghoul") appear in the dungeon generator's
inhabitant pool, they are name-only; no SRD stat blocks or descriptions
are copied.

## Data shape

See `lib/generators/types.ts` for the full TypeScript shapes and
`docs/migrations/2026-05-19-generators-schema-additions.md` for the
schema-additions migration note. All changes are additive; existing
campaigns continue to render exactly as before.
