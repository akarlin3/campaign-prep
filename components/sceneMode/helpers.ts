// Shared helpers for Scene Mode. Kept tiny and dependency-light so the panel,
// hooks, and sub-components can all share one source of truth.

import { getFirebaseAuth } from '@/lib/firebase/client';

export type LooseRecord = Record<string, unknown>;

export function asArray(v: unknown): LooseRecord[] {
  return Array.isArray(v) ? (v as LooseRecord[]) : [];
}

export function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

// Resolve the current user's Firebase ID token. AI routes are pro-gated and
// verify this token server-side (see CLAUDE.md / lib/verify-pro.ts), so every
// scene API call must carry it.
export async function getIdToken(): Promise<string> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error('Not signed in');
  return user.getIdToken();
}
