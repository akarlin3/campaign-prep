'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/auth-context';
import { subscribeToUserCampaigns, createCampaign, type Campaign } from '@/lib/firebase/campaigns';
import { BookOpen, Plus, LogOut, FileText, Calendar } from 'lucide-react';

export default function CampaignListPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeToUserCampaigns(
      user.uid,
      (items) => { setCampaigns(items); setLoading(false); setError(null); },
      (err) => { setError(err.message); setLoading(false); }
    );
    return unsub;
  }, [user]);

  const handleCreate = async () => {
    if (!user) return;
    try {
      const id = await createCampaign(user.uid);
      router.push(`/campaign/${id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create campaign');
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  if (authLoading || !user) {
    return <main className="min-h-screen flex items-center justify-center text-xs text-zinc-500">Loading…</main>;
  }

  return (
    <main className="min-h-screen p-5">
      <div className="max-w-3xl mx-auto space-y-4">
        <header className="pb-3 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-wider">
              <BookOpen size={12} /> Campaign Prep
            </div>
            <h1 className="text-xl font-medium mt-1 text-zinc-50">Your Campaigns</h1>
            <p className="text-xs text-zinc-400 mt-0.5">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="text-xs px-2.5 py-1 rounded border border-zinc-800 text-zinc-300 hover:bg-zinc-900 flex items-center gap-1">
            <LogOut size={12} /> Sign Out
          </button>
        </header>

        <button onClick={handleCreate} className="w-full p-4 rounded border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900/30 transition-colors flex items-center justify-center gap-2 text-sm">
          <Plus size={16} /> New Campaign
        </button>

        {error && <p className="text-xs text-red-400">{error}</p>}

        {loading ? (
          <p className="text-xs text-zinc-500 italic text-center py-6">Loading campaigns…</p>
        ) : campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map((c) => (
              <Link key={c.id} href={`/campaign/${c.id}`} className="block p-3 rounded border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/60 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-zinc-500" />
                  <span className="font-medium text-zinc-100 flex-1">{c.name}</span>
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Calendar size={11} />
                    {c.updatedAt ? new Date(c.updatedAt.toMillis()).toLocaleDateString() : '—'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500 italic text-center py-6">No campaigns yet — create your first one above.</p>
        )}
      </div>
    </main>
  );
}
