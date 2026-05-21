'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? '/campaign' : '/login');
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-parchment text-ink space-y-4">
      <div className="gm-spinner" />
      <div className="text-xs text-brass-deep font-display uppercase tracking-[0.2em] animate-pulse">
        Preparing your table…
      </div>
    </main>
  );
}
