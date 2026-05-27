import { getAdminDb } from '@/lib/firebase/admin';

const LEGACY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Called from server-side processes or cleanups.
 * Idempotent.
 */
export async function migrateCampaignModeAdmin(campaignId: string, snap: any): Promise<void> {
  const data = snap.data?.()?.data ?? snap.data ?? snap;
  if (data?.modeMigratedAt) return;

  const wasSolo =
    data?.soloMode === true ||
    data?.solo === true ||
    data?.mode === 'solo' ||
    data?.__soloMode === true; // Existing toggle field name

  const db = getAdminDb();
  await db.collection('campaigns').doc(campaignId).update({
    'data.mode': wasSolo ? 'duet' : 'standard',
    'data.modeMigratedAt': Date.now(),
    'data.legacySoloMode': wasSolo,
  });
}

/**
 * Scheduled cleanup run weekly. Removes legacySoloMode for migrations
 * older than 30 days.
 */
export async function cleanupLegacyModeField(): Promise<void> {
  const cutoff = Date.now() - LEGACY_RETENTION_MS;
  const db = getAdminDb();
  const snap = await db.collection('campaigns')
    .where('data.modeMigratedAt', '<', cutoff)
    .where('data.legacySoloMode', '!=', null)
    .get();

  await Promise.all(snap.docs.map((doc) =>
    doc.ref.update({ 'data.legacySoloMode': null })
  ));
}
