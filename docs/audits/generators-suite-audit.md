# Generators Suite — Audit (Checkpoint 1)

_Date: 2026-05-19_ · Branch: `claude/generators-suite-audit-AykfZ`

Audit only. No code changes in this PR. Captures the existing generator
architecture, entity schemas, SRD inventory, and navigation surface so the
seven new generators (Treasure Hoards, Magic Item Shops, Mundane Shops,
Trinkets, Taverns, Dungeons, Settlements) extend what's here rather than
forking a parallel system.

---

## 1a. Existing generator architecture

### What exists

| Generator | Component | Data source | Deterministic? | AI-backed? | Pro-gated? |
|---|---|---|---|---|---|
| Names | `components/NamesTab.tsx` | `lib/cultures.ts` (selector options only) | No | Yes (full output) | Yes — tab body wrapped in `<LockedPanel>` in `CampaignEditor.tsx:1888-1895` |
| Locations | `components/LocationsTab.tsx` | `lib/locations.ts` + `lib/cultures.ts` (selector options only) | No | Yes (full output) | Yes — tab body wrapped in `<LockedPanel>` in `CampaignEditor.tsx:1897-1904` |
| Sidekick / NPC concept | `components/SidekickAddPanel.tsx` | `lib/sidekicks.ts` (sidekick classes / base creatures) | Inputs only | Yes (character generation) | Not individually gated |
| Homebrew Monster | inside `components/MonstersTab.tsx` | none (user-driven) | n/a | Yes (concept → stat block) | Not individually gated |
| Inspire tables | `<Inspire>` component, `CampaignEditor.tsx:102-215` | `lib/inspirationTables.ts` (24 tables, 2 621 lines, original content) | Yes (pure JS sampling) | No | No |
| Dice / Quick Roll / Recent Rolls | `components/DiceRoller.tsx` | n/a | Yes (PRNG) | No | No |

### Shared abstractions

- **None for generators.** Names and Locations are structurally identical but share zero component code beyond the `getFirebaseAuth().currentUser?.getIdToken()` → `fetch('/api/generate-…')` → render-list pattern. Each duplicates its own loading / error / "click to copy" UI.
- The closest thing to a `<GeneratorPanel>` is `<Inspire>` (`CampaignEditor.tsx:102-215`) — a popup button that calls `sampleTable(tableId, count)` and emits the picked entry via `onPick`. But it's bound to the `TABLES` registry in `lib/inspirationTables.ts` and to single-entry text output; it cannot host typed inputs, multi-field results, or save-to-campaign actions.
- `sampleTable` and `rollTable` (`lib/inspirationTables.ts:2609-2621`) are the only generic rolling utilities. They sample uniformly from `string[]` tables and use `Math.random()` directly — no seeding, no weighted entries.

### Wiring of "Generate with AI"

Both Pro-gated generators use the same pattern. From `NamesTab.tsx:57-80`:

```ts
const user = getFirebaseAuth().currentUser;
if (!user) throw new Error('Not signed in');
const idToken = await user.getIdToken();
const res = await fetch('/api/generate-names', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
  body: JSON.stringify({ firstCulture, lastCulture, gender, count }),
});
```

The server route (`app/api/generate-locations/route.ts:40-46`) validates Pro entitlement:

```ts
const idToken = readBearerToken(req.headers.get('authorization'));
if (!idToken) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
const verified = await verifyPro(idToken);
if (!verified.ok) return NextResponse.json({ error: verified.message }, { status: verified.status });
```

Then it calls `client.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 4096, system: [{ … cache_control: { type: 'ephemeral' } }], output_config: { format: { type: 'json_schema', schema: … } } })` — JSON schema is declared at the top of the route file. System prompt is cached.

The client-side `isPro` flag (`useAuth()` in `lib/firebase/auth-context.tsx:79-87`) is what determines whether the tab body renders the actual generator or a `<LockedPanel>`. The lock lives at the `CampaignEditor.tsx` tab-switch level, **not inside the generator components**. The generators themselves assume the user is Pro by the time their UI mounts.

### Critical observation — no deterministic base + AI-enhance pattern exists

The Generators Suite spec assumes every new generator produces useful deterministic output for free users, with an optional Pro-only "Enhance with AI" step on top. **The existing Names and Locations generators do not work that way** — they have no deterministic fallback. Non-Pro users see only the `<LockedPanel>` and never get any output at all.

That means **Checkpoint 2's shared `<GeneratorPanel>` abstraction is genuinely new architecture**, not an extraction of an existing pattern. The existing generators can be migrated onto it after the fact (as a follow-up), but they don't dictate its shape. The Inspire popup is the closest behavioural cousin; the AI generators contribute the request/response and `LockedPanel` patterns.

### Recent Rolls / history persistence

- **Dice Recent Rolls** (`DiceRoller.tsx:172, 186, 222, 484-559`): pure `useState<Roll[]>([])`, capped at `MAX_HISTORY = 50`. **Not** persisted to localStorage, IndexedDB, or Firestore. Lost on tab switch (the `tab` state in `CampaignEditor.tsx:998` unmounts `<DiceRoller>` when you leave the Dice tab) or page refresh.
- **Names / Locations / Sidekick history**: no history surface exists at all. Results live in component-local state and vanish on tab switch.
- **Macros** (saved dice formulas) are the only generator-adjacent state that survives — stored in `data.macros` on the campaign doc and persisted via the standard 1.5 s autosync.

The Generators Suite spec's "Recent Generations — last 20 across all generators" requirement therefore **also has no existing pattern to reuse** beyond the in-memory pattern in `DiceRoller`. Persisting it through the same `data.<key>` autosync that the rest of the campaign uses is the path of least resistance.

---

## 1b. Existing entity schemas (Firestore)

### Top-level shape

`lib/firebase/campaigns.ts:9-17`:

```ts
type Campaign = {
  id: string;
  userId: string;
  name: string;
  data: Record<string, any>;     // all entities live here as keyed arrays
  done: Record<string, boolean>;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};
```

**There are no subcollections.** Every entity type is stored as an array inside the single `data` object on the campaign doc and saved by debounced `updateCampaign({ data })` calls.

Known `data.*` keys (from `CampaignEditor.tsx` grep):

| Key | Shape | Notes |
|---|---|---|
| `gWorld`, `gFNL`, `tone`, `lines`, `facts`, `conflicts`, `scenes`, `secrets`, `items`, `monsters` | `string[]` | All free-text lists, no structured fields |
| `factions` | `{ name, archetype, identity, area, power, ideology, shortGoals: string[], midGoals: string[], longGoal }[]` | |
| `pcGoals` | `{ text, timeframe: 'short'\|'mid'\|'long', success, failure, linked }[]` | |
| `locations` | `{ name, type, aspects: [string, string, string], factions }[]` | `type` is a free-text select from `LOCATION_TYPE_GROUPS` |
| `npcs` | `{ name, type, faction, archetype, goal, method, appearance, abilities, talent, mannerism, interactions, knowledge, ideal, bond, flaw }[]` | |
| `clocks` | `{ text, faction, max, filled }[]` | |
| `sessionLogs` | `SessionLog[]` (id, title, date, body) | |
| `characters` | `Character[]` (full PC/sidekick schema in `lib/character-schema.ts`) | |
| `macros` | `{ id, name, formula }[]` | Dice roller macros |
| `spellFavs` | `string[]` | SRD spell indexes |
| `homebrewSpells` | `Spell[]` | |
| `homebrewMonsters` | `HomebrewMonster[]` | Full stat-block-style records |

### Gap analysis vs. Generators Suite needs

| Spec requirement | Current state | Gap |
|---|---|---|
| `Item` with `rarity / cost / attunement / category / source` | `data.items: string[]` — placeholder strings like `"Item · what +1 hook it delivers"` (`CampaignEditor.tsx:1549`) | **Total replacement.** Existing `data.items` is too informal to extend. Need a new shape, with the existing strings continuing to render as legacy entries (no destructive migration needed). |
| `Location.subtype` discriminator (`tavern / dungeon / settlement / wilderness / other`) | `data.locations[].type` is a free-text select with 22 options across 4 groups (`LOCATION_TYPE_GROUPS` in `lib/locations.ts`) — e.g. `"Tavern / Inn"`, `"Dungeon"`, `"Village"`, `"Forest"` | **Needs a derived subtype.** Either add `subtype` alongside the existing freeform `type`, or map `type` → `subtype` via a lookup table. Existing locations without a subtype default to `"other"`. |
| `Location.details` typed by subtype (tavern.menu / dungeon.rooms / settlement.notables…) | `data.locations[].aspects: [string, string, string]` (three free-text aspect strings) | **New optional field.** `details?: TavernDetails \| DungeonDetails \| SettlementDetails \| undefined`. Existing locations without `details` render as today. |
| `NPC.archetype: "full" \| "minor"` | `data.npcs[].archetype` already exists, but is a free-text "villain archetype" descriptor (see `archetypeInspire` in `CampaignEditor.tsx:445-470` — values like "Cult Leader", "Crime Boss") | **Naming collision.** Cannot reuse `archetype`. Rename our discriminator (suggest `tier: "minor" \| "full"`, or `role: "patron" \| "shopkeeper" \| "rumormonger" \| "full"`). |
| `Note` entity (fallback for things that don't fit) | **No `Note` entity exists.** | Either add `data.notes: Note[]`, or treat the existing `data.items: string[]`/`data.secrets: string[]` lists as the fallback target. For generator outputs, prefer creating a real `data.generations` history list (see 1d) and the matching typed entity (Location for taverns/dungeons/settlements, Item per generated item, etc.). |

### Mutation path

Everything goes through the closures `get(key, fallback)` and `setVal(key, value)` inside `CampaignEditor` (`CampaignEditor.tsx` body, around lines 1010-1050). Both read from and write to the local `data` state which is debounced-synced to Firestore by `updateCampaign(id, { data })` in `lib/firebase/campaigns.ts:66-72`.

There is no "create entity" function in the Firebase layer — adding a new entity is "append to the right `data.<key>` array and let autosync flush". The "save to campaign" pipeline for the new generators must follow the same pattern: it needs the editor's `setVal` (or an equivalent injected `addEntity`) rather than calling Firestore directly, otherwise it'll race with the local debounced state.

---

## 1c. SRD content already in-app

| Source | Path | Content | Used by |
|---|---|---|---|
| Spells JSON | `lib/srd/spells.json` (369 KB) | SRD 5.1 spells (391+ entries) — `index, name, level, school, classes, components, duration, desc` | `SpellsTab.tsx:25` (`import spellsData; ALL_SRD_SPELLS = spellsData as Spell[]`) |
| Conditions JSON | `lib/srd/conditions.json` | 14 SRD conditions w/ descriptions | `DMRefTab.tsx` (reference reading) |
| Inspiration tables | `lib/inspirationTables.ts` (2 621 lines, **original content authored for this project** per its own header comment) | 24 tables: `dungeonGoals, wildernessGoals, urbanGoals, villainArchetypes, allyTypes, patronTypes, introductions, climaxes, twists, moralQuandaries, sideQuests, npcMannerisms, npcTalents, npcInteractionTraits, npcIdeals, npcBonds, npcFlawsSecrets, villainSchemes, villainMethods, villainWeaknesses, sideComplications, campaignEvents, npcBackgroundConcepts, raceCharacterNotes` | `<Inspire>` popup throughout `CampaignEditor` |
| Cultures | `lib/cultures.ts` | Selector groups only — culture **labels**, not name lists | `NamesTab`, `LocationsTab` (passed to Claude as a culture parameter) |
| Locations | `lib/locations.ts` | Selector groups only — 22 location type labels in 4 groups | `LocationsTab` |
| Sidekicks | `lib/sidekicks.ts` | Sidekick classes + base creature pools | `SidekickAddPanel`, `app/api/generate-sidekick/route.ts` |

### What is NOT loaded — gaps for the Generators Suite

- **No magic items.** No SRD magic items file. `data.items` in campaigns is a free-text list. The existing `MonstersTab` does not surface magic items either.
- **No mundane equipment / prices.** No SRD equipment list. `Character.equipment` is a single free-text string (`lib/character-schema.ts:47`). `Character.currency: { cp, sp, ep, gp, pp }` exists, so the coin denominations are already canonical (`character-schema.ts`).
- **No SRD monsters as data.** `MonstersTab` is for **homebrew** monsters; it does not load an SRD bestiary. The Generators Suite spec calls for dungeon "inhabitants list (referencing SRD monsters appropriate to theme + tier)" — this will require either bundling an SRD 5.1 / 5.2 monster index file (large) or maintaining a curated pool keyed by theme + CR (smaller, more curated, easier to license-check).
- **No trinket table, no treasure-hoard tables.** Nothing to reuse — all seven generators will need fresh table content. Per the spec's house rules, write original or use ORC/A5E SRD — do **not** copy non-SRD WotC tables.

The spec sentence "the bundle has full SRD spells, monsters with stat blocks, conditions, and item-related strings" is partly inaccurate: spells and conditions are bundled, **monsters and items are not.**

---

## 1d. Navigation surface

Campaign workspace nav lives in `CampaignEditor.tsx:1219-1247` — a vertical sidebar of tab buttons grouped into two rows (`half = Math.ceil(allTabs.length / 2)`). The tab IDs:

```
prep · ref · track · down · dice · spells · names · locations · monsters · dmref
```

Generators sit at peer-tab level:

- `dice` → `<DiceRoller>` — not Pro-gated.
- `names` → `<NamesTab>` if `isPro`, else `<LockedPanel title="Names Generator">…</LockedPanel>`.
- `locations` → `<LocationsTab>` if `isPro`, else `<LockedPanel title="Locations Generator">…</LockedPanel>`.

Inside the `prep` tab, the `<Inspire>` popup is invoked from many field labels (e.g. `CampaignEditor.tsx:1286-1296, 1326-1354, 1462-1494, 1595-1602`) — it's the embedded "roll one entry from a table and inject it into this field" affordance.

### Implication for the seven new generators

Two viable patterns:

1. **Per-generator top-level tabs.** Mirror the existing `names` / `locations` pattern — one tab per new generator. With seven new generators plus three existing, that's ten generator tabs, which would overwhelm the sidebar.
2. **Single `generators` tab with internal sub-nav.** A new top-level `generators` tab whose body groups the seven new generators (`World`, `Treasure`, `People & Places`) and ideally also re-hosts `names` / `locations` for one consistent home. Existing `names` and `locations` tab entries can either redirect to `generators#names` or be removed.

Option 2 matches the spec's Checkpoint 10 ("Single `/campaign/[id]/generators` view"). The implementation in Checkpoint 2 should land the shared `<GeneratorPanel>` and the new `generators` tab shell, then individual generators (Checkpoints 3-9) populate it one at a time.

Pro-gating pattern is unambiguous: the **base deterministic generator** must work for everyone (per Generators Suite house rules), and only the per-result **"Enhance with AI"** button shows a `<LockedInline label="Enhance with AI" />` for non-Pro users. This differs from the existing Names/Locations pattern where the entire tab is locked; the new tabs cannot use `<LockedPanel>` at the tab level.

---

## Non-blocking observations

_Per project policy (defer-minimization), these go here only, not into a backlog._

- `Math.random()` is the only RNG in the codebase (`DiceRoller`, `sampleTable`, `LocationsTab.shuffle`, `NamesTab.shuffleCultures`). No seeded PRNG exists. Checkpoint 2's seeded `rollOn` utility will be the project's first.
- `data.items: string[]` is the most informal of all entity arrays and the most-out-of-place once `Item` becomes structured. Once the new typed `Item` shape lands, the existing string entries can keep rendering as legacy strings (typeof check), or be migrated lazily on edit. No destructive runtime migration needed.
- `data.npcs[].archetype` is currently used as a free-text "villain archetype" descriptor sourced from the `villainArchetypes` table. If we add an NPC "minor vs full" discriminator, do **not** reuse the name `archetype` — use `tier` or `role` to avoid collision.
- The `Inspire` popup is tightly coupled to the `TABLES` registry in `lib/inspirationTables.ts`. If the new generators expose discrete sub-tables (e.g. tavern name halves, dungeon hazards), there's room to either register them in `TABLES` (keeps `<Inspire>` working out of the box) or build a new generic `<TableRollPopup>` that takes an arbitrary `T[]`. Decision deferred to Checkpoint 2.
- Pro-gated routes (`generate-names`, `generate-locations`, `generate-monster`, `generate-sidekick`, `parse-character-sheet`) all share `readBearerToken` + `verifyPro` boilerplate at the top of the handler. A `withPro(handler)` wrapper would consolidate the four-line preamble, but it's a clarity-vs-indirection wash and is out of scope here.
- `generate-sidekick` is not individually Pro-gated in the UI (you can reach `<SidekickAddPanel>` as a non-Pro user inside the prep flow), but the server route itself calls `verifyPro`, so a non-Pro user clicking Generate gets a 403 with no client-side affordance. Pre-existing inconsistency; not in scope.

---

## Audit summary

1. Two existing AI generators (Names, Locations); both Claude-driven, no deterministic fallback. Sidekick + Monster have AI inputs embedded in larger panels. Dice + Inspire popup are deterministic.
2. **No `<GeneratorPanel>` abstraction exists.** Names and Locations are bespoke twins. Checkpoint 2 must build the shared component from scratch; it cannot be an extraction.
3. **No deterministic-base + AI-enhance pattern exists.** Existing AI generators lock the entire tab for non-Pro users. The new generators require the inverse model — free base + Pro `<LockedInline>` enhance — and must not regress to the tab-lock pattern.
4. Pro verification is centralized server-side (`lib/verify-pro.ts`, jose-based JWT verify + Firestore REST lookup, no Admin SDK because the org policy blocks service-account keys per `CLAUDE.md`). Client gating reads `isPro` from `useAuth()`.
5. All campaign entities live as keyed arrays inside `campaigns/{id}.data` — single flat blob, no subcollections, autosynced every 1.5 s by debounced `updateCampaign`. Saves from generators must call the editor's `setVal` (or an injected equivalent) rather than Firestore directly to avoid racing local debounced state.
6. **`Item` is a string array.** `Location.type` is freeform with no `subtype` discriminator. `Location.aspects` is `[string, string, string]`, not structured `details`. `NPC.archetype` already exists but as a *villain-archetype free-text field* — naming collision; use `tier` for the minor/full distinction.
7. **SRD inventory: spells (391+) and conditions (14). No magic items, no mundane equipment, no monsters as data.** All seven new generators will need fresh table content. Per spec: original or ORC/A5E SRD only, source comment at the top of every table file.
8. **Recent Rolls is in-memory only** (`useState`, no persistence). The cross-generator "Recent Generations" history requires either persisting through the same `data.<key>` autosync pattern (durable, syncs across devices) or extending the in-memory pattern (cheap, ephemeral). Recommendation: persistent, via `data.generationsHistory: GenerationHistoryEntry[]` with a cap.
9. Navigation: 10 sidebar tabs in `CampaignEditor`. New surface should land as a single `generators` tab containing internal sub-nav for all seven new generators (and optionally re-home Names/Locations), per Checkpoint 10. The legacy `names` and `locations` top-level tab entries can either redirect or be removed when the unified surface lands.
10. **Critical spec correction:** the spec claims "the bundle has full SRD spells, monsters with stat blocks, conditions, and item-related strings" — only spells and conditions are accurate. Monsters in `MonstersTab` are homebrew; there is no items SRD content of any kind.

---

## Closed in this PR

**Audit + full Generators Suite implementation through Checkpoint 11.**

### What shipped

- **CP2 (infrastructure):** `lib/generators/rng.ts` (mulberry32 SeededRng), `lib/tables/roll.ts` (`rollOn` / `rollMultiple` / `rollOnTiered` / `rollDice` over uniform or weighted tables), `lib/generators/types.ts` (StructuredItem / StructuredLocation with subtype + typed details / StructuredNpc with `tier`, GeneratorResult discriminated union, GenerationHistoryEntry), `lib/generators/save.ts` (pure-function pipeline returning patched `data` + entity refs), `components/generators/GeneratorPanel.tsx` (shared panel — never existed before), `app/api/generators/enhance/route.ts` + `lib/generators/enhance.ts` (single Pro-gated endpoint dispatching on result kind), migration note at `docs/migrations/2026-05-19-generators-schema-additions.md`.
- **CP3 (treasure hoards):** Original CR-tiered coin / gem / art / magic-item tables (49 original magic items, five rarity bands). Source comment at the top of the tables file confirming original authorship.
- **CP4 (trinkets):** Original 100-entry trinket table.
- **CP5 (mundane shops):** Original ~70-entry equipment inventory across 8 shop types with copper-piece base prices and availability tiers; size-keyed price markup and availability matrices.
- **CP6 (magic item shops):** Four archetypes (curio shop, hedge wizard, black market, temple) with per-archetype price multipliers, settlement-size scarcity cap, per-rarity gp ranges. Reuses the CP3 magic-item pool.
- **CP7 (taverns):** Two-part name table, vibe-keyed atmosphere descriptors, settlement-sized menu (food / drink / lodging), patron stubs, templated rumors with random slot-filling.
- **CP8 (dungeons):** Seven themes, four sizes (5/10/20/40 rooms), weighted room-content table, theme/tier-keyed inhabitant pool, hazard table. Save creates a single Location with rooms inside `details.rooms`. v2 deferrals (visual map, connectivity graph, per-room encounter balancing) intentionally not implemented.
- **CP9 (settlements):** Seven size classes with population bands, government / economy tables, notable-role pool, hook table.
- **CP10 (unified surface):** New `generators` top-level tab in `CampaignEditor.tsx` with grouped sidebar (Treasure / World / People & Places), re-homing of existing Names + Locations generators alongside the seven new ones. `RecentGenerations` reads from `data.generationsHistory` (capped at 20). Keyboard shortcuts: G focuses sidebar, R rerolls, S saves, E enhances (Pro-only).
- **CP11 (tests):** 40 tests across four `node:test` files covering RNG, roll utility, all seven `generate()` functions (determinism, range, no undefined SRD references, no item-pool leaks), and the save pipeline (entity counts, source tags, history cap). `npm test` runs them via `tsx`. Full Next.js production build also passes (`npm run build`).

### Pro-gating

All seven new generators produce useful deterministic output **without AI** for free users. Only the per-result "Enhance with AI" button is Pro-gated — non-Pro users see a `<LockedInline label="Enhance with AI" />` that links to the waitlist, matching project policy in `CLAUDE.md`. Server enforcement happens in `/api/generators/enhance` via `verifyPro`.

### Not in scope / intentionally deferred

- Visual dungeon maps, room-connectivity graphs, per-room encounter balancing (CP8).
- Promoting "minor" NPCs to full NPCs from the generated lists (the schema supports it via `tier`, but no promotion UI yet).
- Destructive migration of `data.items: string[]` legacy entries into structured items (they continue to render side-by-side; no migration script needed for the additive schema).
- A `withPro(handler)` wrapper consolidating the four-line preamble across `verifyPro`-gated routes (audit observation; not in scope here).
