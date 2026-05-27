import { checkRateLimit } from '../rate-limit';

const PLAYER_WRITE_RULES = [
  { limit: 60, windowMs: 60_000 }, // 60 updates per minute
];

export function checkPlayerRateLimit(shareToken: string) {
  return checkRateLimit(`player:${shareToken}`, PLAYER_WRITE_RULES);
}

export function enforcePlayerRateLimit(shareToken: string): Response | null {
  const result = checkPlayerRateLimit(shareToken);
  if (result.ok) return null;

  const retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many updates — please wait before modifying character values again.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
      },
    },
  );
}
