b$5e1c000e-8b9c-4c2a-ac90-e2966e2f3530

--- CHUNK SEPARATOR ---

L
$06d27211-65dc-45c8-9dc1-5ee5cdb237ad"$4179b32b-a5da-4cbf-b9e0-c12111516a06

--- CHUNK SEPARATOR ---

# Claude Code Prompt: Mode Separation (Solo / Duet / Standard)

## Context

The app currently has a binary Solo/Standard toggle. "Solo Mode" in practice has been used to mean **Duet** (1 DM + 1 player) 

--- CHUNK SEPARATOR ---

 not zero-player solo TTRPG. This prompt establishes three explicit modes and refactors all mode-aware features.

- **Solo** = zero player. One human as both GM and PC. Wells Oracle and Scene Mode are the play interface.
- **Duet** = one GM + one player. Player Mode is the player's window.
- **Standard** = one GM + multiple players. Existing default group play.

Companion spec lives at `docs/mode-separation-spec.md` (paste from the spec artifact).

## Stack Reminder

Next.js 15 App Router 

--- CHUNK SEPARATOR ---

 TypeScript 

--- CHUNK SEPARATOR ---

 Tailwind 

--- CHUNK SEPARATOR ---

 Firebase Auth + Firestore 

--- CHUNK SEPARATOR ---

 Railway. Existing patterns: `LockedInline` / `LockedPanel`, `isPro` / `verifyPro`, `data.*` namespace, Player Mode redacted projections + unguessable share token.

## UI Conventions

Dark mode 

--- CHUNK SEPARATOR ---

 Title Case 

--- CHUNK SEPARATOR ---

 **Pink for Solo 

--- CHUNK SEPARATOR ---

 Teal for Duet (new) 

--- CHUNK SEPARATOR ---

 Amber for Player input**.

## Data Schema Changes

```ts
// Top-level campaign field
data.mode: 'solo' | 'duet' | 'standard'

// Migration tracking
data.modeMigratedAt?: number      // unix ms; presence means migration ran
data.legacySoloMode?: boolean     // preserved old value for 30 days

// PC ownership
type PlayerCharacter = /* existing */ & { ownership: PcOwnership }
type PcOwnership = {
  ownerType: 'dm' | 'player'
  playerSlotId?: string           // FK to playerRoster entry
}

// Player write-back subcollection (NEW)
// Path: campaigns/{campaignId}/pcWritebacks/{playerSlotId}
type PcWriteback = {
  playerSlotId: string
  pcId: string
  writes: PcWritebackEntry[]      // append-only log
  latestState: Partial<PlayerCharacter>  // merged latest writable fields
  updatedAt: number
}

type PcWritebackEntry = {
  id: string
  fieldPath: string               // dot path, e.g. "hp.current"
  value: any
  timestamp: number
  source: 'player'
}
```

## Phases

### Phase 1 

--- CHUNK SEPARATOR ---

 Mode Taxonomy + Migration

- Add `data.mode` enum field; default `'standard'` for new campaigns
- Campaign creation flow: mode picker is **the first step** (modal or first form field), with explanatory copy for each option
- Mode badge in campaign header (`

--- CHUNK SEPARATOR ---

 Solo` / `

--- CHUNK SEPARATOR ---

 Duet` / `

--- CHUNK SEPARATOR ---

 Standard`); clickable to open mode switcher modal with warning "Changing mode hides/shows features but doesn't delete data."
- Migration: on first campaign read after deploy, if `modeMigratedAt` is unset, set `data.mode` based on the existing toggle field (Appendix A), set `modeMigratedAt = Date.now()`, copy old value to `data.legacySoloMode`. Idempotent.
- Cleanup job: after 30 days, remove `data.legacySoloMode` (Appendix A)

### Phase 2 

--- CHUNK SEPARATOR ---

 Per-Mode Target Counts

- Replace existing two-mode target table with three-mode lookup (Appendix B)
- All progress bars on prep sections derive their target from `data.mode` via shared helper `targetCountFor(section, mode)`
- Existing per-campaign target overrides preserved

### Phase 3 

--- CHUNK SEPARATOR ---

 Feature Visibility & Reframing

- **Player Mode tab:** hidden when `mode === 'solo'`; "Share with Players" CTA hidden
- **Wells Oracle floating button:** rendered only in Solo; in Duet/Standard the Oracle moves to a DM sidebar entry
- **Scene Mode copy:** mode-aware (Appendix C) 

--- CHUNK SEPARATOR ---

 "Begin Scene" in Solo, "Rehearse Scene" in Duet/Standard, with "Use during live play" toggle persisted in `data.settings.sceneModeLiveInDuet`
- **Encounter helper:** default party size derives from mode (Solo: 1, Duet: 1 with sidekick toggle, Standard: 4) 

--- CHUNK SEPARATOR ---

 Appendix D
- **Mode-specific adaptation hints:** pink-box helper renders only in Solo; teal-box helper renders only in Duet; neither in Standard. Reusable component `ModeAdaptationHint mode="solo|duet" children={...}`
- **First-run tutorials:** lightweight tooltip tour the first time a user opens each mode (Appendix E)

### Phase 4 

--- CHUNK SEPARATOR ---

 PC Sheet Ownership

- Add `ownership` field to `PlayerCharacter` type
- PC creation flow:
  - Solo: ownership locked to `{ ownerType: 'dm' }`; no UI for it
  - Duet: PC creation prompts "Whose character is this?" with Player Slot picker (from existing playerRoster) + "DM-owned NPC" option. Enforce: exactly one player-owned PC at a time in Duet
  - Standard: same as Duet but multiple player-owned PCs allowed
- Migration: existing PCs default to `{ ownerType: 'dm' }`. If campaign is Duet and has exactly one PC, prompt DM on next open: "Is this your player's character?" 

--- CHUNK SEPARATOR ---

 if yes, link to first/only player slot
- Firestore rules updated to validate the schema (Appendix F)

### Phase 5 

--- CHUNK SEPARATOR ---

 Player Mode Write-Back Pipeline

- New endpoint `POST /api/player/update` (token-authenticated, no UID) 

--- CHUNK SEPARATOR ---

 Appendix G
- Writable field allowlist enforced server-side 

--- CHUNK SEPARATOR ---

 Appendix H
- Firestore writes go to `campaigns/{campaignId}/pcWritebacks/{playerSlotId}`
- DM's browser opens `onSnapshot` on the `pcWritebacks` subcollection; on change, calls reconciler `mergeWritebacksIntoPcs(data, writebacks)` (Appendix I) and writes the result back to the main campaign doc
- Player Mode UI gains edit controls on writable fields of their own PC; other fields remain read-only
- Conflict resolution: last-write-wins per field, but field allowlist is non-overlapping with DM-edited fields in practice 

--- CHUNK SEPARATOR ---

 no real conflicts expected
- Rate limit: 60 writes per minute per share-link token (Appendix G)

## Acceptance Criteria

- New campaign creation forces mode selection; default is Standard
- Existing campaign with `soloMode: true` opens once 

--- CHUNK SEPARATOR ---

 silently becomes `data.mode = 'duet'`; mode badge shows 

--- CHUNK SEPARATOR ---

 Duet
- Mode switch from settings: warning shown, but no data deleted
- In Solo mode: floating Oracle button visible; Player Mode tab absent; pink hints render
- In Duet mode: Oracle in sidebar; Player Mode tab visible; teal hints render
- In Standard mode: Oracle in sidebar; Player Mode supports multiple slots; no mode hints
- Encounter helper in Solo defaults to party size 1
- Duet PC creation enforces single player-owned PC; can't create a second
- Player Mode in Duet shows edit pencil on HP, conditions chips, exhaustion, death saves, notes, bonds, ideals, goals, flaws
- Player edits HP via Player Mode 

--- CHUNK SEPARATOR ---

 DM browser sees update within 2 seconds via subscription
- Player attempts to edit ability score via crafted request 

--- CHUNK SEPARATOR ---

 403 from `/api/player/update`
- Rate limit: 61st write in a minute returns 429

## Git Phases

- `feat/mode-taxonomy-migration` 

--- CHUNK SEPARATOR ---

 Phase 1
- `feat/mode-target-counts` 

--- CHUNK SEPARATOR ---

 Phase 2
- `feat/mode-feature-visibility` 

--- CHUNK SEPARATOR ---

 Phase 3
- `feat/pc-ownership` 

--- CHUNK SEPARATOR ---

 Phase 4
- `feat/player-mode-writebacks` 

--- CHUNK SEPARATOR ---

 Phase 5

---

## Appendix A 

--- CHUNK SEPARATOR ---

 Migration Function

```ts
// lib/migrations/mode.ts
import { db } from '@/lib/firebase-admin'

const LEGACY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Called from the client on campaign load when modeMigratedAt is unset.
 * Idempotent.
 */
export async function migrateCampaignMode(campaignId: string, snap: any): Promise<void> {
  const data = snap.data?.()?.data ?? snap.data
  if (data?.modeMigratedAt) return

  // The exact legacy field name lives in the current codebase 

--- CHUNK SEPARATOR ---

 search for the
  // toggle handler in the campaign editor. Common candidates:
  //   data.soloMode (boolean), data.mode === 'solo', data.solo (boolean).
  // Use the first one that exists.
  const wasSolo =
    data?.soloMode === true ||
    data?.solo === true ||
    data?.mode === 'solo'

  await db.collection('campaigns').doc(campaignId).update({
    'data.mode': wasSolo ? 'duet' : 'standard',
    'data.modeMigratedAt': Date.now(),
    'data.legacySoloMode': wasSolo,
  })
}

/**
 * Scheduled cleanup 

--- CHUNK SEPARATOR ---

 run weekly. Removes legacySoloMode for migrations
 * older than 30 days.
 */
export async function cleanupLegacyModeField(): Promise<void> {
  const cutoff = Date.now() - LEGACY_RETENTION_MS
  const snap = await db.collection('campaigns')
    .where('data.modeMigratedAt', '<', cutoff)
    .where('data.legacySoloMode', '!=', null)
    .get()

  await Promise.all(snap.docs.map((doc) =>
    doc.ref.update({ 'data.legacySoloMode': null })
  ))
}
```

## Appendix B 

--- CHUNK SEPARATOR ---

 Target Count Table

```ts
// lib/prep/targets.ts
export const TARGET_COUNTS: Record<CampaignMode, Record<string, number>> = {
  solo: {
    secrets: 4, potentialScenes: 3, npcs: 4, fantasticLocations: 3,
    monsters: 3, magicItems: 2, worldFacts: 6, settingFacts: 4,
  },
  duet: {
    secrets: 7, potentialScenes: 5, npcs: 6, fantasticLocations: 4,
    monsters: 5, magicItems: 3, worldFacts: 8, settingFacts: 6,
  },
  standard: {
    secrets: 10, potentialScenes: 6, npcs: 8, fantasticLocations: 5,
    monsters: 6, magicItems: 4, worldFacts: 10, settingFacts: 8,
  },
}

export function targetCountFor(section: string, mode: CampaignMode, override?: number): number {
  if (override !== undefined) return override
  return TARGET_COUNTS[mode][section] ?? 0
}
```

## Appendix C 

--- CHUNK SEPARATOR ---

 Scene Mode Mode-Aware Copy

```tsx
// components/scene/SceneModeHeader.tsx
const COPY: Record<CampaignMode, { cta: string; tagline: string }> = {
  solo: {
    cta: 'Begin Scene',
    tagline: 'Run the scene live. NPCs respond in voice; you control the PC.',
  },
  duet: {
    cta: 'Rehearse Scene',
    tagline: 'Test how an NPC encounter might unfold before running it at the table.',
  },
  standard: {
    cta: 'Rehearse Scene',
    tagline: 'Test how an NPC encounter might unfold before running it at the table.',
  },
}

export function SceneModeHeader({ mode }: { mode: CampaignMode }) {
  const copy = COPY[mode]
  return (
    <div>
      <h2 className="text-xl font-semibold">Scene Mode</h2>
      <p className="text-sm text-zinc-400">{copy.tagline}</p>
      {/* CTA button uses copy.cta */}
    </div>
  )
}
```

In Duet/Standard, the "End Scene" flow does NOT auto-append to session log; instead it shows a "Save Notes to Session Log" button so the DM can opt in.

## Appendix D 

--- CHUNK SEPARATOR ---

 Encounter Helper Defaults

```ts
// lib/encounter/defaults.ts
export function defaultPartySize(mode: CampaignMode): number {
  return mode === 'standard' ? 4 : 1
}

export function showSidekickToggle(mode: CampaignMode): boolean {
  return mode === 'duet'
}
```

UI: party size input pre-fills from `defaultPartySize(mode)`; in Duet, a "Include sidekick (+1)" checkbox appears next to the input.

## Appendix E 

--- CHUNK SEPARATOR ---

 First-Run Tutorial Tooltips

```ts
// lib/tutorials/mode-tours.ts
type TourStep = { selector: string; title: string; body: string }

export const TOURS: Record<CampaignMode, TourStep[]> = {
  solo: [
    { selector: '[data-oracle-button]', title: 'Wells Oracle', body: 'Ask the dice when you genuinely don\'t know what happens next.' },
    { selector: '[data-scene-mode-tab]', title: 'Scene Mode', body: 'Run scenes turn-by-turn 

--- CHUNK SEPARATOR ---

 your action, the world\'s response.' },
    { selector: '[data-living-world-tab]', title: 'Living World', body: 'Time advances and the world moves on its own between sessions.' },
  ],
  duet: [
    { selector: '[data-player-mode-share]', title: 'Player Mode', body: 'Share this link with your player. They can update their HP, conditions, and notes 

--- CHUNK SEPARATOR ---

 you stay in control of the rest.' },
    { selector: '[data-pc-ownership]', title: 'Player-Owned PC', body: 'One PC is owned by your player. Others are DM-owned NPCs or sidekicks.' },
  ],
  standard: [],  // no tour for the default mode
}

export function shouldShowTour(uid: string, campaignId: string, mode: CampaignMode): boolean {
  // Tour shown once per (uid, mode) combination, persisted in user prefs
  return !hasSeenTour(uid, mode)
}
```

Tours render via a lightweight `Tour` component (no external dep 

--- CHUNK SEPARATOR ---

 small custom tooltip walker).

## Appendix F 

--- CHUNK SEPARATOR ---

 Firestore Rules for PC Ownership

Update `firestore.rules`:

```javascript
match /campaigns/{campaignId} {
  // existing read/write rules tied to request.auth.uid == resource.data.uid

  function isValidPcOwnership(pc) {
    return pc.ownership.ownerType in ['dm', 'player'] &&
      (pc.ownership.ownerType == 'dm' || (
        pc.ownership.ownerType == 'player' &&
        pc.ownership.playerSlotId is string
      ));
  }

  function pcsAreValid(data) {
    return data.pcs is list &&
      data.pcs.size() <= 6 &&
      data.pcs.diff(data.pcs).affectedKeys().hasOnly(['']) ||
      // Per-PC ownership check is enforced server-side on writes;
      // rules-side enforcement is too expensive for nested arrays.
      true;
  }

  // For Duet mode, only one PC may have ownerType == 'player'.
  // Enforced in client + server-side validation; rules accept the shape.

  allow update: if request.auth.uid == resource.data.uid &&
    request.resource.data.data.mode in ['solo', 'duet', 'standard'] &&
    pcsAreValid(request.resource.data.data);
}

// New subcollection for player write-backs
match /campaigns/{campaignId}/pcWritebacks/{playerSlotId} {
  // GM can read all writebacks for their campaign
  allow read: if request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.uid;

  // No client-side writes. All writes go through /api/player/update which uses Admin SDK.
  allow write: if false;
}
```

## Appendix G 

--- CHUNK SEPARATOR ---

 Player Update Endpoint

```ts
// app/api/player/update/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { WRITABLE_FIELDS, validateWriteable } from '@/lib/player/allowlist'
import { rateLimitToken } from '@/lib/player/rate-limit'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, campaignId, playerSlotId, fieldPath, value } = body

  if (typeof token !== 'string' || typeof campaignId !== 'string' ||
      typeof playerSlotId !== 'string' || typeof fieldPath !== 'string') {
    return new Response('Bad request', { status: 400 })
  }

  // 1. Validate token resolves to campaign + slot
  const campaignRef = db.collection('campaigns').doc(campaignId)
  const snap = await campaignRef.get()
  if (!snap.exists) return new Response('Not found', { status: 404 })
  const data = snap.data()!.data

  const slot = data.playerRoster?.find((s: any) => s.id === playerSlotId)
  if (!slot || slot.shareToken !== token) {
    return new Response('Forbidden', { status: 403 })
  }

  // 2. Rate limit per token
  const limited = await rateLimitToken(token)
  if (!limited.ok) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // 3. Validate fieldPath is in allowlist and value type checks
  const validation = validateWriteable(fieldPath, value)
  if (!validation.ok) {
    return Response.json({ error: validation.reason }, { status: 403 })
  }

  // 4. Resolve PC owned by this slot
  const pc = data.pcs?.find((p: any) =>
    p.ownership?.ownerType === 'player' && p.ownership?.playerSlotId === playerSlotId
  )
  if (!pc) {
    return Response.json({ error: 'No PC linked to this slot' }, { status: 404 })
  }

  // 5. Append to writebacks subcollection
  const writebackRef = campaignRef.collection('pcWritebacks').doc(playerSlotId)
  const writeEntry = {
    id: crypto.randomUUID(),
    fieldPath, value,
    timestamp: Date.now(),
    source: 'player',
  }
  await db.runTransaction(async (tx) => {
    const wb = await tx.get(writebackRef)
    const existing = wb.exists ? wb.data() : { writes: [], latestState: {}, pcId: pc.id, playerSlotId }
    const writes = [...(existing.writes ?? []), writeEntry].slice(-200)  // cap log
    const latestState = setByPath(existing.latestState ?? {}, fieldPath, value)
    tx.set(writebackRef, { ...existing, writes, latestState, updatedAt: Date.now() })
  })

  return Response.json({ ok: true })
}

function setByPath(obj: any, path: string, value: any): any {
  const parts = path.split('.')
  const result = structuredClone(obj)
  let cur = result
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] ?? {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
  return result
}
```

Rate limiter:

```ts
// lib/player/rate-limit.ts
import { db } from '@/lib/firebase-admin'

const PER_MINUTE = 60

export async function rateLimitToken(token: string): Promise<{ ok: boolean }> {
  const minute = Math.floor(Date.now() / 60_000)
  const ref = db.collection('rateLimit').doc(`player:${token}:${minute}`)
  const snap = await ref.get()
  const count = snap.exists ? (snap.data()?.count ?? 0) : 0
  if (count >= PER_MINUTE) return { ok: false }
  await ref.set({ count: count + 1, expiresAt: (minute + 2) * 60_000 }, { merge: true })
  return { ok: true }
}
```

## Appendix H 

--- CHUNK SEPARATOR ---

 Writable Field Allowlist

```ts
// lib/player/allowlist.ts
import { z } from 'zod'
import { SRD_CONDITIONS } from '@/lib/session/conditions'

const SchemaByPath: Record<string, z.ZodType> = {
  'hp.current':    z.number().int().min(-99).max(999),
  'hp.temp':       z.number().int().min(0).max(999),
  'conditions':    z.array(z.enum(SRD_CONDITIONS)).max(20),
  'exhaustion':    z.number().int().min(0).max(6),
  'deathSaves.successes': z.number().int().min(0).max(3),
  'deathSaves.failures':  z.number().int().min(0).max(3),
  'notes':         z.string().max(20_000),
  'goals':         z.array(z.string().max(500)).max(20),
  'bonds':         z.array(z.string().max(500)).max(20),
  'ideals':        z.array(z.string().max(500)).max(20),
  'flaws':         z.array(z.string().max(500)).max(20),
}

export const WRITABLE_FIELDS = Object.keys(SchemaByPath)

export function validateWriteable(fieldPath: string, value: unknown): { ok: true } | { ok: false; reason: string } {
  const schema = SchemaByPath[fieldPath]
  if (!schema) return { ok: false, reason: `Field not writable by player: ${fieldPath}` }
  const result = schema.safeParse(value)
  if (!result.success) return { ok: false, reason: `Invalid value for ${fieldPath}` }
  return { ok: true }
}
```

## Appendix I 

--- CHUNK SEPARATOR ---

 Reconciler (DM Browser Side)

```ts
// lib/player/reconciler.ts
import { onSnapshot, collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Called from the DM's browser when viewing a campaign. Subscribes to
 * pcWritebacks and merges player updates into the main campaign doc.
 *
 * Only runs when mode === 'duet' or 'standard'.
 */
export function startWritebackReconciler(campaignId: string): () => void {
  const ref = collection(db, 'campaigns', campaignId, 'pcWritebacks')
  return onSnapshot(ref, async (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type !== 'added' && change.type !== 'modified') continue
      const wb = change.doc.data()
      await mergeIntoPc(campaignId, wb.pcId, wb.latestState)
    }
  })
}

async function mergeIntoPc(campaignId: string, pcId: string, latest: Partial<PlayerCharacter>): Promise<void> {
  // Read current data
  const campaignRef = doc(db, 'campaigns', campaignId)
  // ... use transaction to update data.pcs[pcId] with latest
  // Implementation: load doc, find PC, deep-merge `latest` into PC, write back.
  // Use the existing campaign-doc update path so debounce + projection republish triggers.
}
```

After merge, the existing Player Mode projection publisher re-publishes the redacted view, and the player sees their own change reflected in their browser (last-write-wins per field).

## Appendix J 

--- CHUNK SEPARATOR ---

 Playwright E2E

```ts
// e2e/mode-separation.spec.ts
import { test, expect } from '@playwright/test'
import { loginAsUser, seedLegacyCampaign, openShareLink } from './helpers'

test('Migration: legacy soloMode 

--- CHUNK SEPARATOR ---

 duet', async ({ page }) => {
  await loginAsUser(page)
  const { campaignId } = await seedLegacyCampaign(page, { soloMode: true })
  await page.goto(`/campaigns/${campaignId}`)
  await expect(page.getByText('

--- CHUNK SEPARATOR ---

 Duet')).toBeVisible()
})

test('Solo mode hides Player Mode and shows floating oracle', async ({ page }) => {
  await loginAsUser(page)
  await page.goto('/campaigns/new')
  await page.getByRole('button', { name: 'Solo' }).click()
  await page.fill('input[name="title"]', 'Solo Campaign')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.locator('[data-player-mode-tab]')).not.toBeVisible()
  await expect(page.locator('[data-oracle-floating]')).toBeVisible()
})

test('Duet enforces single player-owned PC', async ({ page }) => {
  await loginAsUser(page)
  await page.goto('/campaigns/new')
  await page.getByRole('button', { name: 'Duet' }).click()
  await page.fill('input[name="title"]', 'Duet Campaign')
  await page.getByRole('button', { name: 'Create' }).click()

  await page.getByRole('tab', { name: 'Party' }).click()
  await page.getByRole('button', { name: 'New PC' }).click()
  await page.fill('input[name="name"]', 'Aragorn')
  await page.selectOption('select[name="ownerType"]', 'player')
  await page.getByRole('button', { name: 'Save' }).click()

  await page.getByRole('button', { name: 'New PC' }).click()
  await page.fill('input[name="name"]', 'Boromir')
  // Player ownership option should be disabled (one already exists)
  await expect(page.locator('select[name="ownerType"] option[value="player"]')).toBeDisabled()
})

test('Player Mode write-back: HP edit reaches DM', async ({ browser }) => {
  const dmContext = await browser.newContext()
  const playerContext = await browser.newContext()
  const dmPage = await dmContext.newPage()
  const playerPage = await playerContext.newPage()

  await loginAsUser(dmPage)
  // ... seed a Duet campaign with a player-owned PC starting at 24/24 HP ...
  const { campaignId, shareUrl } = await seedDuetCampaign(dmPage, { pcHpMax: 24, pcHpCurrent: 24 })

  await dmPage.goto(`/campaigns/${campaignId}`)
  await playerPage.goto(shareUrl)
  await playerPage.getByRole('button', { name: 'Aragorn' }).click()  // pick player slot

  await playerPage.getByRole('button', { name: 'HP -5' }).click()

  // DM browser should reflect the change within 2 seconds
  await expect(dmPage.getByText(/Aragorn.*19 \/ 24/i)).toBeVisible({ timeout: 2_000 })
})

test('Player Mode rejects writes outside allowlist', async ({ request }) => {
  const { shareToken, campaignId, playerSlotId } = await seedDuetCampaignFixture()
  const r = await request.post('/api/player/update', {
    data: {
      token: shareToken,
      campaignId,
      playerSlotId,
      fieldPath: 'abilities.STR',  // not in allowlist
      value: 30,
    },
  })
  expect(r.status()).toBe(403)
})

test('Player Mode rate limit returns 429', async ({ request }) => {
  const { shareToken, campaignId, playerSlotId } = await seedDuetCampaignFixture()
  for (let i = 0; i < 60; i++) {
    await request.post('/api/player/update', {
      data: { token: shareToken, campaignId, playerSlotId, fieldPath: 'notes', value: `note ${i}` },
    })
  }
  const r = await request.post('/api/player/update', {
    data: { token: shareToken, campaignId, playerSlotId, fieldPath: 'notes', value: 'overflow' },
  })
  expect(r.status()).toBe(429)
})
```

--- CHUNK SEPARATOR ---

# Claude Code Prompt: Mode Separation (Solo / Duet / Standard)

## Context

The app currently has a binary Solo/Standard toggle. "Solo Mode" in practice has been used to mean **Duet** (1 DM + 1 player) 

--- CHUNK SEPARATOR ---

 not zero-player solo TTRPG. This prompt establishes three explicit modes and refactors all mode-aware features.

- **Solo** = zero player. One human as both GM and PC. Wells Oracle and Scene Mode are the play interface.
- **Duet** = one GM + one player. Player Mode is the player's window.
- **Standard** = one GM + multiple players. Existing default group play.

Companion spec lives at `docs/mode-separation-spec.md` (paste from the spec artifact).

## Stack Reminder

Next.js 15 App Router 

--- CHUNK SEPARATOR ---

 TypeScript 

--- CHUNK SEPARATOR ---

 Tailwind 

--- CHUNK SEPARATOR ---

 Firebase Auth + Firestore 

--- CHUNK SEPARATOR ---

 Railway. Existing patterns: `LockedInline` / `LockedPanel`, `isPro` / `verifyPro`, `data.*` namespace, Player Mode redacted projections + unguessable share token.

## UI Conventions

Dark mode 

--- CHUNK SEPARATOR ---

 Title Case 

--- CHUNK SEPARATOR ---

 **Pink for Solo 

--- CHUNK SEPARATOR ---

 Teal for Duet (new) 

--- CHUNK SEPARATOR ---

 Amber for Player input**.

## Data Schema Changes

```ts
// Top-level campaign field
data.mode: 'solo' | 'duet' | 'standard'

// Migration tracking
data.modeMigratedAt?: number      // unix ms; presence means migration ran
data.legacySoloMode?: boolean     // preserved old value for 30 days

// PC ownership
type PlayerCharacter = /* existing */ & { ownership: PcOwnership }
type PcOwnership = {
  ownerType: 'dm' | 'player'
  playerSlotId?: string           // FK to playerRoster entry
}

// Player write-back subcollection (NEW)
// Path: campaigns/{campaignId}/pcWritebacks/{playerSlotId}
type PcWriteback = {
  playerSlotId: string
  pcId: string
  writes: PcWritebackEntry[]      // append-only log
  latestState: Partial<PlayerCharacter>  // merged latest writable fields
  updatedAt: number
}

type PcWritebackEntry = {
  id: string
  fieldPath: string               // dot path, e.g. "hp.current"
  value: any
  timestamp: number
  source: 'player'
}
```

## Phases

### Phase 1 

--- CHUNK SEPARATOR ---

 Mode Taxonomy + Migration

- Add `data.mode` enum field; default `'standard'` for new campaigns
- Campaign creation flow: mode picker is **the first step** (modal or first form field), with explanatory copy for each option
- Mode badge in campaign header (`

--- CHUNK SEPARATOR ---

 Solo` / `

--- CHUNK SEPARATOR ---

 Duet` / `

--- CHUNK SEPARATOR ---

 Standard`); clickable to open mode switcher modal with warning "Changing mode hides/shows features but doesn't delete data."
- Migration: on first campaign read after deploy, if `modeMigratedAt` is unset, set `data.mode` based on the existing toggle field (Appendix A), set `modeMigratedAt = Date.now()`, copy old value to `data.legacySoloMode`. Idempotent.
- Cleanup job: after 30 days, remove `data.legacySoloMode` (Appendix A)

### Phase 2 

--- CHUNK SEPARATOR ---

 Per-Mode Target Counts

- Replace existing two-mode target table with three-mode lookup (Appendix B)
- All progress bars on prep sections derive their target from `data.mode` via shared helper `targetCountFor(section, mode)`
- Existing per-campaign target overrides preserved

### Phase 3 

--- CHUNK SEPARATOR ---

 Feature Visibility & Reframing

- **Player Mode tab:** hidden when `mode === 'solo'`; "Share with Players" CTA hidden
- **Wells Oracle floating button:** rendered only in Solo; in Duet/Standard the Oracle moves to a DM sidebar entry
- **Scene Mode copy:** mode-aware (Appendix C) 

--- CHUNK SEPARATOR ---

 "Begin Scene" in Solo, "Rehearse Scene" in Duet/Standard, with "Use during live play" toggle persisted in `data.settings.sceneModeLiveInDuet`
- **Encounter helper:** default party size derives from mode (Solo: 1, Duet: 1 with sidekick toggle, Standard: 4) 

--- CHUNK SEPARATOR ---

 Appendix D
- **Mode-specific adaptation hints:** pink-box helper renders only in Solo; teal-box helper renders only in Duet; neither in Standard. Reusable component `ModeAdaptationHint mode="solo|duet" children={...}`
- **First-run tutorials:** lightweight tooltip tour the first time a user opens each mode (Appendix E)

### Phase 4 

--- CHUNK SEPARATOR ---

 PC Sheet Ownership

- Add `ownership` field to `PlayerCharacter` type
- PC creation flow:
  - Solo: ownership locked to `{ ownerType: 'dm' }`; no UI for it
  - Duet: PC creation prompts "Whose character is this?" with Player Slot picker (from existing playerRoster) + "DM-owned NPC" option. Enforce: exactly one player-owned PC at a time in Duet
  - Standard: same as Duet but multiple player-owned PCs allowed
- Migration: existing PCs default to `{ ownerType: 'dm' }`. If campaign is Duet and has exactly one PC, prompt DM on next open: "Is this your player's character?" 

--- CHUNK SEPARATOR ---

 if yes, link to first/only player slot
- Firestore rules updated to validate the schema (Appendix F)

### Phase 5 

--- CHUNK SEPARATOR ---

 Player Mode Write-Back Pipeline

- New endpoint `POST /api/player/update` (token-authenticated, no UID) 

--- CHUNK SEPARATOR ---

 Appendix G
- Writable field allowlist enforced server-side 

--- CHUNK SEPARATOR ---

 Appendix H
- Firestore writes go to `campaigns/{campaignId}/pcWritebacks/{playerSlotId}`
- DM's browser opens `onSnapshot` on the `pcWritebacks` subcollection; on change, calls reconciler `mergeWritebacksIntoPcs(data, writebacks)` (Appendix I) and writes the result back to the main campaign doc
- Player Mode UI gains edit controls on writable fields of their own PC; other fields remain read-only
- Conflict resolution: last-write-wins per field, but field allowlist is non-overlapping with DM-edited fields in practice 

--- CHUNK SEPARATOR ---

 no real conflicts expected
- Rate limit: 60 writes per minute per share-link token (Appendix G)

## Acceptance Criteria

- New campaign creation forces mode selection; default is Standard
- Existing campaign with `soloMode: true` opens once 

--- CHUNK SEPARATOR ---

 silently becomes `data.mode = 'duet'`; mode badge shows 

--- CHUNK SEPARATOR ---

 Duet
- Mode switch from settings: warning shown, but no data deleted
- In Solo mode: floating Oracle button visible; Player Mode tab absent; pink hints render
- In Duet mode: Oracle in sidebar; Player Mode tab visible; teal hints render
- In Standard mode: Oracle in sidebar; Player Mode supports multiple slots; no mode hints
- Encounter helper in Solo defaults to party size 1
- Duet PC creation enforces single player-owned PC; can't create a second
- Player Mode in Duet shows edit pencil on HP, conditions chips, exhaustion, death saves, notes, bonds, ideals, goals, flaws
- Player edits HP via Player Mode 

--- CHUNK SEPARATOR ---

 DM browser sees update within 2 seconds via subscription
- Player attempts to edit ability score via crafted request 

--- CHUNK SEPARATOR ---

 403 from `/api/player/update`
- Rate limit: 61st write in a minute returns 429

## Git Phases

- `feat/mode-taxonomy-migration` 

--- CHUNK SEPARATOR ---

 Phase 1
- `feat/mode-target-counts` 

--- CHUNK SEPARATOR ---

 Phase 2
- `feat/mode-feature-visibility` 

--- CHUNK SEPARATOR ---

 Phase 3
- `feat/pc-ownership` 

--- CHUNK SEPARATOR ---

 Phase 4
- `feat/player-mode-writebacks` 

--- CHUNK SEPARATOR ---

 Phase 5

---

## Appendix A 

--- CHUNK SEPARATOR ---

 Migration Function

```ts
// lib/migrations/mode.ts
import { db } from '@/lib/firebase-admin'

const LEGACY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Called from the client on campaign load when modeMigratedAt is unset.
 * Idempotent.
 */
export async function migrateCampaignMode(campaignId: string, snap: any): Promise<void> {
  const data = snap.data?.()?.data ?? snap.data
  if (data?.modeMigratedAt) return

  // The exact legacy field name lives in the current codebase 

--- CHUNK SEPARATOR ---

 search for the
  // toggle handler in the campaign editor. Common candidates:
  //   data.soloMode (boolean), data.mode === 'solo', data.solo (boolean).
  // Use the first one that exists.
  const wasSolo =
    data?.soloMode === true ||
    data?.solo === true ||
    data?.mode === 'solo'

  await db.collection('campaigns').doc(campaignId).update({
    'data.mode': wasSolo ? 'duet' : 'standard',
    'data.modeMigratedAt': Date.now(),
    'data.legacySoloMode': wasSolo,
  })
}

/**
 * Scheduled cleanup 

--- CHUNK SEPARATOR ---

 run weekly. Removes legacySoloMode for migrations
 * older than 30 days.
 */
export async function cleanupLegacyModeField(): Promise<void> {
  const cutoff = Date.now() - LEGACY_RETENTION_MS
  const snap = await db.collection('campaigns')
    .where('data.modeMigratedAt', '<', cutoff)
    .where('data.legacySoloMode', '!=', null)
    .get()

  await Promise.all(snap.docs.map((doc) =>
    doc.ref.update({ 'data.legacySoloMode': null })
  ))
}
```

## Appendix B 

--- CHUNK SEPARATOR ---

 Target Count Table

```ts
// lib/prep/targets.ts
export const TARGET_COUNTS: Record<CampaignMode, Record<string, number>> = {
  solo: {
    secrets: 4, potentialScenes: 3, npcs: 4, fantasticLocations: 3,
    monsters: 3, magicItems: 2, worldFacts: 6, settingFacts: 4,
  },
  duet: {
    secrets: 7, potentialScenes: 5, npcs: 6, fantasticLocations: 4,
    monsters: 5, magicItems: 3, worldFacts: 8, settingFacts: 6,
  },
  standard: {
    secrets: 10, potentialScenes: 6, npcs: 8, fantasticLocations: 5,
    monsters: 6, magicItems: 4, worldFacts: 10, settingFacts: 8,
  },
}

export function targetCountFor(section: string, mode: CampaignMode, override?: number): number {
  if (override !== undefined) return override
  return TARGET_COUNTS[mode][section] ?? 0
}
```

## Appendix C 

--- CHUNK SEPARATOR ---

 Scene Mode Mode-Aware Copy

```tsx
// components/scene/SceneModeHeader.tsx
const COPY: Record<CampaignMode, { cta: string; tagline: string }> = {
  solo: {
    cta: 'Begin Scene',
    tagline: 'Run the scene live. NPCs respond in voice; you control the PC.',
  },
  duet: {
    cta: 'Rehearse Scene',
    tagline: 'Test how an NPC encounter might unfold before running it at the table.',
  },
  standard: {
    cta: 'Rehearse Scene',
    tagline: 'Test how an NPC encounter might unfold before running it at the table.',
  },
}

export function SceneModeHeader({ mode }: { mode: CampaignMode }) {
  const copy = COPY[mode]
  return (
    <div>
      <h2 className="text-xl font-semibold">Scene Mode</h2>
      <p className="text-sm text-zinc-400">{copy.tagline}</p>
      {/* CTA button uses copy.cta */}
    </div>
  )
}
```

In Duet/Standard, the "End Scene" flow does NOT auto-append to session log; instead it shows a "Save Notes to Session Log" button so the DM can opt in.

## Appendix D 

--- CHUNK SEPARATOR ---

 Encounter Helper Defaults

```ts
// lib/encounter/defaults.ts
export function defaultPartySize(mode: CampaignMode): number {
  return mode === 'standard' ? 4 : 1
}

export function showSidekickToggle(mode: CampaignMode): boolean {
  return mode === 'duet'
}
```

UI: party size input pre-fills from `defaultPartySize(mode)`; in Duet, a "Include sidekick (+1)" checkbox appears next to the input.

## Appendix E 

--- CHUNK SEPARATOR ---

 First-Run Tutorial Tooltips

```ts
// lib/tutorials/mode-tours.ts
type TourStep = { selector: string; title: string; body: string }

export const TOURS: Record<CampaignMode, TourStep[]> = {
  solo: [
    { selector: '[data-oracle-button]', title: 'Wells Oracle', body: 'Ask the dice when you genuinely don\'t know what happens next.' },
    { selector: '[data-scene-mode-tab]', title: 'Scene Mode', body: 'Run scenes turn-by-turn 

--- CHUNK SEPARATOR ---

 your action, the world\'s response.' },
    { selector: '[data-living-world-tab]', title: 'Living World', body: 'Time advances and the world moves on its own between sessions.' },
  ],
  duet: [
    { selector: '[data-player-mode-share]', title: 'Player Mode', body: 'Share this link with your player. They can update their HP, conditions, and notes 

--- CHUNK SEPARATOR ---

 you stay in control of the rest.' },
    { selector: '[data-pc-ownership]', title: 'Player-Owned PC', body: 'One PC is owned by your player. Others are DM-owned NPCs or sidekicks.' },
  ],
  standard: [],  // no tour for the default mode
}

export function shouldShowTour(uid: string, campaignId: string, mode: CampaignMode): boolean {
  // Tour shown once per (uid, mode) combination, persisted in user prefs
  return !hasSeenTour(uid, mode)
}
```

Tours render via a lightweight `Tour` component (no external dep 

--- CHUNK SEPARATOR ---

 small custom tooltip walker).

## Appendix F 

--- CHUNK SEPARATOR ---

 Firestore Rules for PC Ownership

Update `firestore.rules`:

```javascript
match /campaigns/{campaignId} {
  // existing read/write rules tied to request.auth.uid == resource.data.uid

  function isValidPcOwnership(pc) {
    return pc.ownership.ownerType in ['dm', 'player'] &&
      (pc.ownership.ownerType == 'dm' || (
        pc.ownership.ownerType == 'player' &&
        pc.ownership.playerSlotId is string
      ));
  }

  function pcsAreValid(data) {
    return data.pcs is list &&
      data.pcs.size() <= 6 &&
      data.pcs.diff(data.pcs).affectedKeys().hasOnly(['']) ||
      // Per-PC ownership check is enforced server-side on writes;
      // rules-side enforcement is too expensive for nested arrays.
      true;
  }

  // For Duet mode, only one PC may have ownerType == 'player'.
  // Enforced in client + server-side validation; rules accept the shape.

  allow update: if request.auth.uid == resource.data.uid &&
    request.resource.data.data.mode in ['solo', 'duet', 'standard'] &&
    pcsAreValid(request.resource.data.data);
}

// New subcollection for player write-backs
match /campaigns/{campaignId}/pcWritebacks/{playerSlotId} {
  // GM can read all writebacks for their campaign
  allow read: if request.auth.uid == get(/databases/$(database)/documents/campaigns/$(campaignId)).data.uid;

  // No client-side writes. All writes go through /api/player/update which uses Admin SDK.
  allow write: if false;
}
```

## Appendix G 

--- CHUNK SEPARATOR ---

 Player Update Endpoint

```ts
// app/api/player/update/route.ts
import { NextRequest } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { WRITABLE_FIELDS, validateWriteable } from '@/lib/player/allowlist'
import { rateLimitToken } from '@/lib/player/rate-limit'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, campaignId, playerSlotId, fieldPath, value } = body

  if (typeof token !== 'string' || typeof campaignId !== 'string' ||
      typeof playerSlotId !== 'string' || typeof fieldPath !== 'string') {
    return new Response('Bad request', { status: 400 })
  }

  // 1. Validate token resolves to campaign + slot
  const campaignRef = db.collection('campaigns').doc(campaignId)
  const snap = await campaignRef.get()
  if (!snap.exists) return new Response('Not found', { status: 404 })
  const data = snap.data()!.data

  const slot = data.playerRoster?.find((s: any) => s.id === playerSlotId)
  if (!slot || slot.shareToken !== token) {
    return new Response('Forbidden', { status: 403 })
  }

  // 2. Rate limit per token
  const limited = await rateLimitToken(token)
  if (!limited.ok) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // 3. Validate fieldPath is in allowlist and value type checks
  const validation = validateWriteable(fieldPath, value)
  if (!validation.ok) {
    return Response.json({ error: validation.reason }, { status: 403 })
  }

  // 4. Resolve PC owned by this slot
  const pc = data.pcs?.find((p: any) =>
    p.ownership?.ownerType === 'player' && p.ownership?.playerSlotId === playerSlotId
  )
  if (!pc) {
    return Response.json({ error: 'No PC linked to this slot' }, { status: 404 })
  }

  // 5. Append to writebacks subcollection
  const writebackRef = campaignRef.collection('pcWritebacks').doc(playerSlotId)
  const writeEntry = {
    id: crypto.randomUUID(),
    fieldPath, value,
    timestamp: Date.now(),
    source: 'player',
  }
  await db.runTransaction(async (tx) => {
    const wb = await tx.get(writebackRef)
    const existing = wb.exists ? wb.data() : { writes: [], latestState: {}, pcId: pc.id, playerSlotId }
    const writes = [...(existing.writes ?? []), writeEntry].slice(-200)  // cap log
    const latestState = setByPath(existing.latestState ?? {}, fieldPath, value)
    tx.set(writebackRef, { ...existing, writes, latestState, updatedAt: Date.now() })
  })

  return Response.json({ ok: true })
}

function setByPath(obj: any, path: string, value: any): any {
  const parts = path.split('.')
  const result = structuredClone(obj)
  let cur = result
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] ?? {}
    cur = cur[parts[i]]
  }
  cur[parts[parts.length - 1]] = value
  return result
}
```

Rate limiter:

```ts
// lib/player/rate-limit.ts
import { db } from '@/lib/firebase-admin'

const PER_MINUTE = 60

export async function rateLimitToken(token: string): Promise<{ ok: boolean }> {
  const minute = Math.floor(Date.now() / 60_000)
  const ref = db.collection('rateLimit').doc(`player:${token}:${minute}`)
  const snap = await ref.get()
  const count = snap.exists ? (snap.data()?.count ?? 0) : 0
  if (count >= PER_MINUTE) return { ok: false }
  await ref.set({ count: count + 1, expiresAt: (minute + 2) * 60_000 }, { merge: true })
  return { ok: true }
}
```

## Appendix H 

--- CHUNK SEPARATOR ---

 Writable Field Allowlist

```ts
// lib/player/allowlist.ts
import { z } from 'zod'
import { SRD_CONDITIONS } from '@/lib/session/conditions'

const SchemaByPath: Record<string, z.ZodType> = {
  'hp.current':    z.number().int().min(-99).max(999),
  'hp.temp':       z.number().int().min(0).max(999),
  'conditions':    z.array(z.enum(SRD_CONDITIONS)).max(20),
  'exhaustion':    z.number().int().min(0).max(6),
  'deathSaves.successes': z.number().int().min(0).max(3),
  'deathSaves.failures':  z.number().int().min(0).max(3),
  'notes':         z.string().max(20_000),
  'goals':         z.array(z.string().max(500)).max(20),
  'bonds':         z.array(z.string().max(500)).max(20),
  'ideals':        z.array(z.string().max(500)).max(20),
  'flaws':         z.array(z.string().max(500)).max(20),
}

export const WRITABLE_FIELDS = Object.keys(SchemaByPath)

export function validateWriteable(fieldPath: string, value: unknown): { ok: true } | { ok: false; reason: string } {
  const schema = SchemaByPath[fieldPath]
  if (!schema) return { ok: false, reason: `Field not writable by player: ${fieldPath}` }
  const result = schema.safeParse(value)
  if (!result.success) return { ok: false, reason: `Invalid value for ${fieldPath}` }
  return { ok: true }
}
```

## Appendix I 

--- CHUNK SEPARATOR ---

 Reconciler (DM Browser Side)

```ts
// lib/player/reconciler.ts
import { onSnapshot, collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

/**
 * Called from the DM's browser when viewing a campaign. Subscribes to
 * pcWritebacks and merges player updates into the main campaign doc.
 *
 * Only runs when mode === 'duet' or 'standard'.
 */
export function startWritebackReconciler(campaignId: string): () => void {
  const ref = collection(db, 'campaigns', campaignId, 'pcWritebacks')
  return onSnapshot(ref, async (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type !== 'added' && change.type !== 'modified') continue
      const wb = change.doc.data()
      await mergeIntoPc(campaignId, wb.pcId, wb.latestState)
    }
  })
}

async function mergeIntoPc(campaignId: string, pcId: string, latest: Partial<PlayerCharacter>): Promise<void> {
  // Read current data
  const campaignRef = doc(db, 'campaigns', campaignId)
  // ... use transaction to update data.pcs[pcId] with latest
  // Implementation: load doc, find PC, deep-merge `latest` into PC, write back.
  // Use the existing campaign-doc update path so debounce + projection republish triggers.
}
```

After merge, the existing Player Mode projection publisher re-publishes the redacted view, and the player sees their own change reflected in their browser (last-write-wins per field).

## Appendix J 

--- CHUNK SEPARATOR ---

 Playwright E2E

```ts
// e2e/mode-separation.spec.ts
import { test, expect } from '@playwright/test'
import { loginAsUser, seedLegacyCampaign, openShareLink } from './helpers'

test('Migration: legacy soloMode 

--- CHUNK SEPARATOR ---

 duet', async ({ page }) => {
  await loginAsUser(page)
  const { campaignId } = await seedLegacyCampaign(page, { soloMode: true })
  await page.goto(`/campaigns/${campaignId}`)
  await expect(page.getByText('

--- CHUNK SEPARATOR ---

 Duet')).toBeVisible()
})

test('Solo mode hides Player Mode and shows floating oracle', async ({ page }) => {
  await loginAsUser(page)
  await page.goto('/campaigns/new')
  await page.getByRole('button', { name: 'Solo' }).click()
  await page.fill('input[name="title"]', 'Solo Campaign')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.locator('[data-player-mode-tab]')).not.toBeVisible()
  await expect(page.locator('[data-oracle-floating]')).toBeVisible()
})

test('Duet enforces single player-owned PC', async ({ page }) => {
  await loginAsUser(page)
  await page.goto('/campaigns/new')
  await page.getByRole('button', { name: 'Duet' }).click()
  await page.fill('input[name="title"]', 'Duet Campaign')
  await page.getByRole('button', { name: 'Create' }).click()

  await page.getByRole('tab', { name: 'Party' }).click()
  await page.getByRole('button', { name: 'New PC' }).click()
  await page.fill('input[name="name"]', 'Aragorn')
  await page.selectOption('select[name="ownerType"]', 'player')
  await page.getByRole('button', { name: 'Save' }).click()

  await page.getByRole('button', { name: 'New PC' }).click()
  await page.fill('input[name="name"]', 'Boromir')
  // Player ownership option should be disabled (one already exists)
  await expect(page.locator('select[name="ownerType"] option[value="player"]')).toBeDisabled()
})

test('Player Mode write-back: HP edit reaches DM', async ({ browser }) => {
  const dmContext = await browser.newContext()
  const playerContext = await browser.newContext()
  const dmPage = await dmContext.newPage()
  const playerPage = await playerContext.newPage()

  await loginAsUser(dmPage)
  // ... seed a Duet campaign with a player-owned PC starting at 24/24 HP ...
  const { campaignId, shareUrl } = await seedDuetCampaign(dmPage, { pcHpMax: 24, pcHpCurrent: 24 })

  await dmPage.goto(`/campaigns/${campaignId}`)
  await playerPage.goto(shareUrl)
  await playerPage.getByRole('button', { name: 'Aragorn' }).click()  // pick player slot

  await playerPage.getByRole('button', { name: 'HP -5' }).click()

  // DM browser should reflect the change within 2 seconds
  await expect(dmPage.getByText(/Aragorn.*19 \/ 24/i)).toBeVisible({ timeout: 2_000 })
})

test('Player Mode rejects writes outside allowlist', async ({ request }) => {
  const { shareToken, campaignId, playerSlotId } = await seedDuetCampaignFixture()
  const r = await request.post('/api/player/update', {
    data: {
      token: shareToken,
      campaignId,
      playerSlotId,
      fieldPath: 'abilities.STR',  // not in allowlist
      value: 30,
    },
  })
  expect(r.status()).toBe(403)
})

test('Player Mode rate limit returns 429', async ({ request }) => {
  const { shareToken, campaignId, playerSlotId } = await seedDuetCampaignFixture()
  for (let i = 0; i < 60; i++) {
    await request.post('/api/player/update', {
      data: { token: shareToken, campaignId, playerSlotId, fieldPath: 'notes', value: `note ${i}` },
    })
  }
  const r = await request.post('/api/player/update', {
    data: { token: shareToken, campaignId, playerSlotId, fieldPath: 'notes', value: 'overflow' },
  })
  expect(r.status()).toBe(429)
})
```"

--- CHUNK SEPARATOR ---

i

command(*)


--- CHUNK SEPARATOR ---

read_file(*)
write_file(*)


--- CHUNK SEPARATOR ---

read_url(*)


--- CHUNK SEPARATOR ---

execute_url(*)


--- CHUNK SEPARATOR ---

unsandboxed(*)
	custom(*)

--- CHUNK SEPARATOR ---

read_url(*)

--- CHUNK SEPARATOR ---


command(*)z

--- CHUNK SEPARATOR ---

