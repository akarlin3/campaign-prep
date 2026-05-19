// Seeded PRNG (mulberry32) for reproducible / shareable generator output.
// Same seed in -> same sequence out. Free to clone via `fork()` so a saved
// generation result can be re-rolled identically from its seed.

export type SeededRng = {
  next: () => number; // uniform [0, 1)
  int: (min: number, max: number) => number; // inclusive both ends
  pick: <T>(arr: readonly T[]) => T;
  shuffle: <T>(arr: readonly T[]) => T[];
  fork: () => SeededRng;
  seed: number;
};

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed?: number): SeededRng {
  const s = typeof seed === 'number' && Number.isFinite(seed)
    ? Math.floor(seed) >>> 0
    : (Math.floor(Math.random() * 0xffffffff) >>> 0);
  const next = mulberry32(s);
  const api: SeededRng = {
    seed: s,
    next,
    int: (min, max) => {
      if (max < min) [min, max] = [max, min];
      return min + Math.floor(next() * (max - min + 1));
    },
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    fork: () => makeRng(Math.floor(next() * 0xffffffff)),
  };
  return api;
}
