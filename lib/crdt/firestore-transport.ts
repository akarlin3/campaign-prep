/**
 * Firestore transport for Yjs updates.
 *
 * Wire format: opaque binary blobs ferried through a Firestore subcollection.
 * No field-level encoding — Firestore is a dumb pipe here. Two collections per
 * campaign:
 *
 *   campaigns/{id}/crdtUpdates/{auto}   each: { update: Bytes, clientId, clock, createdAt }
 *   campaigns/{id}/crdtSnapshots/{auto} each: { state: Bytes, stateVector: Bytes, throughClock, createdAt }
 *
 * Reconciliation uses Yjs state vectors. The snapshot is the compacted state
 * fold; old updates whose ops are subsumed by the snapshot are deleted in a
 * GC pass after a new snapshot is written. A device offline long enough to
 * miss pruned updates rebuilds correctly from snapshot + state-vector diff.
 */
import {
  collection, doc, addDoc, getDocs, getDoc, setDoc, onSnapshot, deleteDoc,
  orderBy, query, serverTimestamp, where, Bytes, writeBatch, Timestamp,
} from 'firebase/firestore';
import * as Y from 'yjs';
import { getDb } from '@/lib/firebase/client';

const UPDATES = 'crdtUpdates';
const SNAPSHOTS = 'crdtSnapshots';

// Local origin tag for updates we apply *from* Firestore so the local
// observer can avoid echoing them back as new writes.
export const REMOTE_ORIGIN = Symbol('crdt-remote');
export const SNAPSHOT_ORIGIN = Symbol('crdt-snapshot');

export type UpdateDoc = {
  update: Uint8Array;
  clientId: string;
  clock: number;
};

export type SnapshotDoc = {
  state: Uint8Array;
  stateVector: Uint8Array;
  throughClock: number;
};

function updatesCol(campaignId: string) {
  return collection(getDb(), 'campaigns', campaignId, UPDATES);
}
function snapshotsCol(campaignId: string) {
  return collection(getDb(), 'campaigns', campaignId, SNAPSHOTS);
}

/** Get the latest snapshot for a campaign, or null if none exists yet. */
export async function getLatestSnapshot(campaignId: string): Promise<SnapshotDoc | null> {
  const snaps = await getDocs(query(snapshotsCol(campaignId), orderBy('throughClock', 'desc')));
  if (snaps.empty) return null;
  const d = snaps.docs[0].data() as any;
  return {
    state: d.state instanceof Bytes ? d.state.toUint8Array() : new Uint8Array(d.state ?? []),
    stateVector: d.stateVector instanceof Bytes ? d.stateVector.toUint8Array() : new Uint8Array(d.stateVector ?? []),
    throughClock: d.throughClock ?? 0,
  };
}

/** Get all updates with clock > sinceClock. */
export async function getUpdatesSince(campaignId: string, sinceClock: number): Promise<UpdateDoc[]> {
  const q = query(updatesCol(campaignId), where('clock', '>', sinceClock), orderBy('clock', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const raw = d.data() as any;
    return {
      update: raw.update instanceof Bytes ? raw.update.toUint8Array() : new Uint8Array(raw.update ?? []),
      clientId: raw.clientId,
      clock: raw.clock,
    };
  });
}

export async function getAllUpdates(campaignId: string): Promise<UpdateDoc[]> {
  return getUpdatesSince(campaignId, -1);
}

/** Subscribe to new updates with clock > sinceClock. Returns unsubscriber. */
export function subscribeUpdates(
  campaignId: string,
  sinceClock: number,
  onUpdate: (u: UpdateDoc) => void,
  onError?: (e: Error) => void,
): () => void {
  // We can't use a Firestore where('clock', '>') on a live listener and also
  // capture historical updates without flicker, so the caller is expected to
  // do an initial getUpdatesSince() first and then subscribe at the resulting
  // max-clock+1. We watch with the same filter so we only see *new* writes.
  const q = query(updatesCol(campaignId), where('clock', '>', sinceClock), orderBy('clock', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type !== 'added') continue;
        const raw = change.doc.data() as any;
        onUpdate({
          update: raw.update instanceof Bytes ? raw.update.toUint8Array() : new Uint8Array(raw.update ?? []),
          clientId: raw.clientId,
          clock: raw.clock,
        });
      }
    },
    onError,
  );
}

/** Append a binary update to the log. */
export async function writeUpdate(
  campaignId: string,
  update: Uint8Array,
  clientId: string,
  clock: number,
): Promise<void> {
  await addDoc(updatesCol(campaignId), {
    update: Bytes.fromUint8Array(update),
    clientId,
    clock,
    createdAt: serverTimestamp(),
  });
}

/**
 * Write a new compacted snapshot and delete every update with clock <=
 * throughClock. Idempotent — concurrent snapshots from two devices are both
 * valid; the loader picks the highest throughClock.
 */
export async function writeSnapshotAndGc(
  campaignId: string,
  state: Uint8Array,
  stateVector: Uint8Array,
  throughClock: number,
): Promise<void> {
  await addDoc(snapshotsCol(campaignId), {
    state: Bytes.fromUint8Array(state),
    stateVector: Bytes.fromUint8Array(stateVector),
    throughClock,
    createdAt: serverTimestamp(),
  });
  // GC: delete superseded updates and older snapshots.
  const olderUpdates = await getDocs(query(updatesCol(campaignId), where('clock', '<=', throughClock)));
  const batch = writeBatch(getDb());
  olderUpdates.forEach((d) => batch.delete(d.ref));
  const olderSnaps = await getDocs(query(snapshotsCol(campaignId), where('throughClock', '<', throughClock)));
  olderSnaps.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Helper: max clock in a list of updates, or -1 if empty. */
export function maxClock(updates: UpdateDoc[]): number {
  let m = -1;
  for (const u of updates) if (u.clock > m) m = u.clock;
  return m;
}
