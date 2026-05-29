'use client';

import { use, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';
import { useCampaignAndWorld } from '@/lib/useCampaignAndWorld';
import RecapView from '@/components/RecapView';
import type { SessionLogEntry } from '@/lib/sessionLog';

type Params = { id: string; sessionId: string };

export default function RecapPage({ params }: { params: Promise<Params> }) {
  const { id, sessionId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const { campaign, loading, error, crdtReady } = useCampaignAndWorld(id);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  const entry = useMemo<SessionLogEntry | null>(() => {
    if (!campaign) return null;
    const entries = (campaign.data?.sessionLogV2 as SessionLogEntry[] | undefined) || [];
    return entries.find(e => e.id === sessionId) || null;
  }, [campaign, sessionId]);

  const isCurrentlyLoading = authLoading || loading || (campaign && user && campaign.userId === user.uid && !crdtReady);

  if (isCurrentlyLoading) {
    return <main className="flex min-h-screen items-center justify-center text-xs text-ink-mute">Loading…</main>;
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center p-5">
        <div className="space-y-3 text-center">
          <p className="text-sm text-crimson">{error.message}</p>
          <button onClick={() => router.replace(`/campaign/${id}`)} className="rounded border border-rule px-3 py-1 text-xs text-ink-soft hover:bg-parchment-deep">
            Back to campaign
          </button>
        </div>
      </main>
    );
  }

  if (!campaign || !user) return null;

  if (campaign.userId !== user.uid) {
    return (
      <main className="flex min-h-screen items-center justify-center p-5">
        <div className="space-y-3 text-center">
          <p className="text-sm text-crimson">Access denied</p>
          <button onClick={() => router.replace(`/campaign/${id}`)} className="rounded border border-rule px-3 py-1 text-xs text-ink-soft hover:bg-parchment-deep">
            Back to campaign
          </button>
        </div>
      </main>
    );
  }

  if (!entry) {
    return (
      <main className="flex min-h-screen items-center justify-center p-5">
        <div className="space-y-3 text-center">
          <p className="text-sm text-ink-soft">Session log not found.</p>
          <button onClick={() => router.replace(`/campaign/${id}`)} className="rounded border border-rule px-3 py-1 text-xs text-ink-soft hover:bg-parchment-deep">
            Back to campaign
          </button>
        </div>
      </main>
    );
  }

  return <RecapView campaign={campaign} entry={entry} />;
}

