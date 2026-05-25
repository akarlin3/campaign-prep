# Player Mode

A player-facing, read-only view of a campaign, reached via a share link. Players
see only what the GM reveals — party-wide by default, with per-player overrides.
No player accounts: players pick a name from a GM-defined roster and the choice
is remembered in `localStorage`.

> Design history and the rejected alternatives are in
> `docs/player-mode-audit.md`. Deferred ideas live in
> `docs/player-mode-future.md`.

## Why this shape (the constraints)

This deployment **cannot create Firebase service-account keys** (org policy), so
the Admin SDK is unavailable for new features and there are **no Cloud
Functions** deployed. It also stores an entire campaign as **one Firestore
document** (`campaigns/{id}.data`), not per-entity collections. Those three facts
ruled out the "obvious" design (anonymous-auth custom claims + a Cloud Function
shadow-collection writer keyed by entity id).

Instead: **the GM's own browser** — which already holds full, authenticated
access to the campaign — computes the redacted, per-player payloads and publishes
them to **public-read** documents. Players read those directly with real-time
listeners. The unguessable share token in the URL/path is the capability.

## Data model

```
campaigns/{id}.data.player : PlayerConfig          // GM-only (campaign doc)
  shareToken       : string   // unguessable; in the /play/<token> link + path
  tokenVersion     : number   // bumped on rotation
  roster           : RosterSlot[]   // { slotId, displayName, color?, createdAtMs? }
  fieldDefaults    : { [entityType]: { [field]: 'public'|'private' } }
  entityVisibility : { [entityType]: { [entityId]: EntityVisibility } }
  handouts?        : EntityVisibility            // gates the single handouts string

campaigns/{id}.data.playerLog : PlayerLogEntry[]   // GM-only narration source
  { id, text, mentions:[{entityType,entityId,label}], visibility, authorRef, postedAtMs }

EntityVisibility = { mode: 'private'|'party'|'custom', allowedSlotIds?, fieldOverrides? }
```

Published (public-read, GM-write) docs that players consume:

```
playerShares/{shareToken}                  : ShareMeta
  { campaignId, campaignName, tokenVersion, roster }
playerShares/{shareToken}/slots/{slotId}   : SlotProjection
  { campaignName, tokenVersion, slotId, entities, handouts, sessionLog, updatedAtMs }
```

Entities are arrays in `campaign.data` (some historically lacked ids). The
idempotent migration (`lib/playerMode/migration.ts`, run on GM open via
`ensurePlayerModeInitialized`) backfills ids on `npcs/locations/factions/clocks`,
seeds the player config, and migrates legacy `isPublic` flags to `party`.

## The visibility resolver (single source of truth)

`lib/playerMode/resolveVisibility.ts` decides, for one entity and one slot:
is the entity visible, and which fields. Precedence:

1. Unknown entity type → fully private (fail-closed).
2. Entity-level: `private` hides all; `party` shows to everyone; `custom` shows
   only to `allowedSlotIds`.
3. Field-level (visible entities only): per-instance `fieldOverrides[field]`
   wins over the campaign `fieldDefaults[entityType][field]`; a field listed in
   neither is **private** (fail-closed).

This function is used by the projection builder, the GM "preview as player"
panel, and is mirrored by the rules tests. **Do not duplicate visibility logic
elsewhere** — extend the resolver (Heuristic-drift rule).

## Projection flow (the "writer")

`lib/playerMode/projection.ts` (`buildShareMeta`, `buildSlotProjection`) turns
the campaign + config into the public payloads, using the resolver per entity
and stripping the internal `visibility` field from log entries.
`lib/playerMode/publish.ts` (`publishProjections`) writes the meta doc + one slot
doc per roster member and **prunes** slot docs for removed members
(`staleSlotIds`). `PlayerModePanel` debounce-calls this on any relevant change,
so projections refresh live during a session.

**Limitation:** projections only update while a GM client is connected. That's
acceptable — reveals happen at the table when the GM is active.

## Security model

- Rules (`firestore.rules`): `playerShares/**` is **public-read**; **write** is
  allowed only to the GM who owns the campaign the token maps to, and a meta doc
  may only be created under a token that matches the campaign's current
  `shareToken` (so a leaked token can't be hijacked to another campaign).
  Players can never read source `campaigns/{id}` docs.
- **Field-level privacy is enforced by redaction at publish time** — private
  fields are never written into the slot doc, so they aren't on the wire.
- **Per-player secrecy is best-effort.** With no player accounts, anyone holding
  the link could read sibling slot docs via the SDK. Per-player overrides guard
  against *accidental* viewing at the table, not a determined inspector. True
  isolation would require player accounts (out of scope by spec).
- **Token rotation** (`rotateShareToken`) issues a new token + version and
  deletes the old share docs, invalidating every outstanding link.

## Reveals from the session log

Posting a narration entry (`data.playerLog`) with `@`-mentions auto-reveals the
mentioned entities (`lib/playerMode/sessionLog.ts`, `applyNarrationReveal`).
Reveals are **sticky**: `party` upgrades a private entity to party; `custom`
seeds/unions the entry's slots; nothing is ever narrowed, and editing entry text
never un-reveals.

## Adding visibility support to a new entity type

1. Add the type to `PLAYER_ENTITY_TYPES` in `lib/playerMode/types.ts`.
2. Add a field-privacy default map for it in `lib/playerMode/fieldDefaults.ts`.
3. If its array elements lack stable ids, add it to `ID_BACKFILL_TYPES` in
   `lib/playerMode/migration.ts`.
4. Add a `TYPE_LABELS` entry in `components/PlayerModePanel.tsx` and a `TYPE_META`
   entry (label + icon) in `components/PlayerCampaignView.tsx`.

Everything else (resolver, projection, publisher, rules) is generic.

## Tests

- Unit (vitest, `lib/playerMode/__tests__`): resolver matrix, projection
  redaction + defaults cascade, migration idempotency, slot validation, publish
  helpers, sticky reveals, roster cleanup, slot storage.
- Rules (emulator): `npm run test:rules` — GM/other-GM/player read+write matrix,
  incl. token-hijack prevention.

## Known limitations

- Projections refresh only while a GM client is open (above).
- Per-player secrecy is best-effort without accounts (above).
- String-array entities (`items`, `monsters`, `treasure`) and `spells`/`notes`
  are out of scope for field-level visibility (see audit "Entity scope").
- No app-level rate limit on the public reads (players read Firestore directly,
  not through an API); unguessable tokens + Firestore quotas are the current
  mitigation. App Check is the future hardening (`docs/player-mode-future.md`).
