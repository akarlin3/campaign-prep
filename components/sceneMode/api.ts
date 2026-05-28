// Typed wrappers around the pro-gated Scene Mode API routes. Every call carries
// the caller's Firebase ID token in the Authorization header; the routes verify
// it server-side via verifyPro (see CLAUDE.md). Request payloads, methods, and
// headers here are intentionally identical to the previous inline fetch calls —
// this module only adds types and removes duplication, never changes behavior.

import type { SceneTurn } from '@/lib/scene/types';
import type { SceneTurnRequest } from '@/lib/scene/prompt';

function authHeaders(idToken: string): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` };
}

// POST /api/scene/summarize-turns — returns the trimmed summary, or '' on any
// non-ok response (callers treat a missing summary as non-fatal).
export async function summarizeTurns(idToken: string, turns: SceneTurn[]): Promise<string> {
  const res = await fetch('/api/scene/summarize-turns', {
    method: 'POST',
    headers: authHeaders(idToken),
    body: JSON.stringify({ turns }),
  });
  if (!res.ok) return '';
  const json = (await res.json()) as { summary?: string };
  return json.summary ?? '';
}

// POST /api/scene/turn — opens the SSE stream for a turn. Returns the raw
// Response so the caller can drive the reader (the stream parsing lives in the
// hook). The abort signal is threaded through for cancellation.
export async function postSceneTurn(
  idToken: string,
  body: SceneTurnRequest,
  signal: AbortSignal,
): Promise<Response> {
  return fetch('/api/scene/turn', {
    method: 'POST',
    headers: authHeaders(idToken),
    body: JSON.stringify(body),
    signal,
  });
}

// POST /api/scene/voice-check — returns the verdict string or null on failure.
export async function checkVoice(
  idToken: string,
  payload: { traits: string; voice: string; line: string },
): Promise<string | null> {
  const res = await fetch('/api/scene/voice-check', {
    method: 'POST',
    headers: authHeaders(idToken),
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const { verdict } = (await res.json()) as { verdict?: string };
  return typeof verdict === 'string' ? verdict : null;
}
