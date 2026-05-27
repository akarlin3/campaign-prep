import { z } from 'zod';

export const PlayerUpdatePayloadSchema = z.object({
  pcId: z.string(),
  field: z.enum([
    'hp.current',
    'hp.temp',
    'conditions',
    'exhaustion',
    'deathSaves.successes',
    'deathSaves.failures',
    'notes',
    'goals',
    'bonds',
    'ideals',
    'flaws',
  ]),
  value: z.any(),
});

export type PlayerUpdatePayload = z.infer<typeof PlayerUpdatePayloadSchema>;

export function validatePlayerField(field: string, value: unknown): boolean {
  switch (field) {
    case 'hp.current':
      return z.number().int().nonnegative().safeParse(value).success;
    case 'hp.temp':
      return z.number().int().nonnegative().safeParse(value).success;
    case 'conditions':
      return z.array(z.string()).safeParse(value).success;
    case 'exhaustion':
      return z.number().int().min(0).max(6).safeParse(value).success;
    case 'deathSaves.successes':
      return z.number().int().min(0).max(3).safeParse(value).success;
    case 'deathSaves.failures':
      return z.number().int().min(0).max(3).safeParse(value).success;
    case 'notes':
      return z.string().safeParse(value).success;
    case 'goals':
    case 'bonds':
    case 'ideals':
    case 'flaws':
      return z.array(z.string()).safeParse(value).success;
    default:
      return false;
  }
}
