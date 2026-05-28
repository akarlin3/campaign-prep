# Changelog

## Unreleased

### Added — Offline-first CRDT sync for campaign data

Multi-device offline editing now converges without losing edits. Previously
Firestore's document-level last-write-wins meant a GM editing an NPC on
one device offline and a secret on another offline would silently lose one
set of edits on next sync. Campaign content now flows through a per-
campaign **Yjs CRDT**, persisted locally via `y-indexeddb` and transported
through Firestore as opaque binary updates with state-vector reconciliation
and snapshot-based GC.

- `lib/crdt/yjs-adapter.ts` — JSON ↔ Y.Doc conversion with id-keyed array
  merge.
- `lib/crdt/persistence.ts` — `y-indexeddb` integration; per-campaign DB
  namespace so it doesn't collide with Firestore's own local cache.
- `lib/crdt/firestore-transport.ts` — append-only `crdtUpdates/`
  subcollection + `crdtSnapshots/` for compaction.
- `lib/crdt/sync.ts` — orchestrator: IndexedDB hydration, remote
  reconciliation, live subscription, periodic snapshot + GC.
- `lib/crdt/use-crdt-campaign.ts` — React hook used by
  `useCampaignAndWorld`.
- Player Mode projections regenerate from the merged Y.Doc JSON view —
  reveal semantics (Private/Party/Custom), `@`-mention auto-reveal,
  sticky reveals, and the share-token capability all preserved.
- Firestore Rules updated for the new subcollections (owner-only, append-
  only, GC-permitted).

See [`docs/offline-sync.md`](docs/offline-sync.md) for the schema,
reconciliation algorithm, and trade-offs.
