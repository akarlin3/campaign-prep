/**
 * IndexedDB persistence for the campaign Y.Doc via y-indexeddb.
 *
 * Each campaign gets its own IndexedDB database, named
 * `gmb-campaign-<campaignId>`. Firestore SDK uses its own IndexedDB
 * namespace (`firestore/...`), so the two don't collide.
 */
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';

const dbNameFor = (campaignId: string) => `gmb-campaign-${campaignId}`;

export type LocalPersistence = {
  provider: IndexeddbPersistence;
  whenSynced: Promise<void>;
  destroy: () => Promise<void>;
};

export function attachLocalPersistence(doc: Y.Doc, campaignId: string): LocalPersistence {
  const provider = new IndexeddbPersistence(dbNameFor(campaignId), doc);
  const whenSynced = new Promise<void>((resolve) => {
    if ((provider as any).synced) {
      resolve();
    } else {
      provider.once('synced', () => resolve());
    }
  });
  return {
    provider,
    whenSynced,
    destroy: async () => {
      await provider.destroy();
    },
  };
}

/**
 * Wipe a campaign's local IndexedDB Y.Doc state. Used after the legacy
 * Firestore document is removed or for explicit reset. Safe to call when
 * nothing is persisted.
 */
export async function wipeLocalPersistence(campaignId: string): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(dbNameFor(campaignId));
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}
