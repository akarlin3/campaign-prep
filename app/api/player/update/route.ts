import { getAdminDb } from '@/lib/firebase/admin';
import { validatePlayerField } from '@/lib/player/allowlist';
import { enforcePlayerRateLimit } from '@/lib/player/rate-limit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shareToken, slotId, pcId, field, value } = body;

    if (!shareToken || typeof shareToken !== 'string' || shareToken.length < 20) {
      return new Response(JSON.stringify({ error: 'Invalid or missing share token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!slotId || typeof slotId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing slot ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!pcId || typeof pcId !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid or missing PC ID' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate Limiting
    const limitRes = enforcePlayerRateLimit(shareToken);
    if (limitRes) return limitRes;

    // Field & Value Allowlist Check
    if (!validatePlayerField(field, value)) {
      return new Response(JSON.stringify({ error: 'Forbidden or invalid field update' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getAdminDb();
    const shareSnap = await db.collection('playerShares').doc(shareToken).get();
    if (!shareSnap.exists) {
      return new Response(JSON.stringify({ error: 'Invalid share token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const shareData = shareSnap.data()!;
    const campaignId = shareData.campaignId;
    const roster = shareData.roster || [];

    const slotExists = roster.some((r: any) => r.slotId === slotId);
    if (!slotExists) {
      return new Response(JSON.stringify({ error: 'Invalid player slot' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const writebackRef = db
      .collection('campaigns')
      .doc(campaignId)
      .collection('pcWritebacks')
      .doc(slotId);

    await writebackRef.set(
      {
        pcId,
        slotId,
        updates: {
          [field]: value,
        },
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Player update error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
