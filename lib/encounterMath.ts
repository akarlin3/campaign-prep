// 5e-style XP thresholds by character level — values from the 5.1 SRD
// Licensed under CC-BY-4.0; attribution: "This work includes material taken
// from the System Reference Document 5.1 by Wizards of the Coast."

export const XP_THRESHOLDS: Record<number, { easy: number; medium: number; hard: number; deadly: number }> = {
  1:  { easy: 25,    medium: 50,    hard: 75,    deadly: 100 },
  2:  { easy: 50,    medium: 100,   hard: 150,   deadly: 200 },
  3:  { easy: 75,    medium: 150,   hard: 225,   deadly: 400 },
  4:  { easy: 125,   medium: 250,   hard: 375,   deadly: 500 },
  5:  { easy: 250,   medium: 500,   hard: 750,   deadly: 1100 },
  6:  { easy: 300,   medium: 600,   hard: 900,   deadly: 1400 },
  7:  { easy: 350,   medium: 750,   hard: 1100,  deadly: 1700 },
  8:  { easy: 450,   medium: 900,   hard: 1400,  deadly: 2100 },
  9:  { easy: 550,   medium: 1100,  hard: 1600,  deadly: 2400 },
  10: { easy: 600,   medium: 1200,  hard: 1900,  deadly: 2800 },
  11: { easy: 800,   medium: 1600,  hard: 2400,  deadly: 3600 },
  12: { easy: 1000,  medium: 2000,  hard: 3000,  deadly: 4500 },
  13: { easy: 1100,  medium: 2200,  hard: 3400,  deadly: 5100 },
  14: { easy: 1250,  medium: 2500,  hard: 3800,  deadly: 5700 },
  15: { easy: 1400,  medium: 2800,  hard: 4300,  deadly: 6400 },
  16: { easy: 1600,  medium: 3200,  hard: 4800,  deadly: 7200 },
  17: { easy: 2000,  medium: 3900,  hard: 5900,  deadly: 8800 },
  18: { easy: 2100,  medium: 4200,  hard: 6300,  deadly: 9500 },
  19: { easy: 2400,  medium: 4900,  hard: 7300,  deadly: 10900 },
  20: { easy: 2800,  medium: 5700,  hard: 8500,  deadly: 12700 },
};

// CR to base XP mapping
export const CR_TO_XP: Record<string, number> = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
  "1": 200, "2": 450, "3": 700, "4": 1100, "5": 1800,
  "6": 2300, "7": 2900, "8": 3900, "9": 5000, "10": 5900,
  "11": 7200, "12": 8400, "13": 10000, "14": 11500, "15": 13000,
  "16": 15000, "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000, "25": 75000,
  "26": 90000, "27": 105000, "28": 120000, "29": 135000, "30": 155000,
};

export function encounterMultiplier(monsterCount: number): number {
  if (monsterCount === 1) return 1;
  if (monsterCount === 2) return 1.5;
  if (monsterCount <= 6) return 2;
  if (monsterCount <= 10) return 2.5;
  if (monsterCount <= 14) return 3;
  return 4;
}

// For solo play, the SRD recommends multiplying threshold by 0.5 for a single PC
// to compensate for the lack of party action economy. We expose both readings.
// Gestalt PCs (two classes per level, best-of features) recover most of that lost
// action economy through extra HP, spells, and per-round options — we use the
// full standard threshold (1.0x) instead of the solo 0.75x reduction.
export function difficultyForSolo(adjustedXP: number, pcLevel: number, gestalt = false): {
  rating: 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Deadly' | 'Lethal';
  rationale: string;
} {
  const t = XP_THRESHOLDS[pcLevel] ?? XP_THRESHOLDS[1];
  const mod = gestalt ? 1.0 : 0.75;
  const label = gestalt ? 'Gestalt' : 'Solo';
  const soloEasy = Math.round(t.easy * mod);
  const soloMedium = Math.round(t.medium * mod);
  const soloHard = Math.round(t.hard * mod);
  const soloDeadly = Math.round(t.deadly * mod);

  if (adjustedXP < soloEasy) return { rating: 'Trivial', rationale: `Below ${label.toLowerCase()} easy threshold (${soloEasy})` };
  if (adjustedXP < soloMedium) return { rating: 'Easy', rationale: `${label} easy: ${soloEasy}–${soloMedium - 1}` };
  if (adjustedXP < soloHard) return { rating: 'Medium', rationale: `${label} medium: ${soloMedium}–${soloHard - 1}` };
  if (adjustedXP < soloDeadly) return { rating: 'Hard', rationale: `${label} hard: ${soloHard}–${soloDeadly - 1}` };
  if (adjustedXP < soloDeadly * 1.5) return { rating: 'Deadly', rationale: `${label} deadly: ${soloDeadly}+` };
  return { rating: 'Lethal', rationale: `Well above ${label.toLowerCase()} deadly threshold (${soloDeadly}). Reconsider.` };
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'deadly';
export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'deadly'];

export type PartyMember = {
  level: number;
  weight: number; // 1 for a PC, 0.5 for a sidekick
  gestalt: boolean;
};

export type PartyThresholds = Record<Difficulty, number>;

// Sum standard 5e XP thresholds across the party. Sidekicks contribute at half
// weight. The solo penalty (0.75x for a lone non-gestalt PC) is applied only
// when the effective party is one PC or smaller; gestalt PCs use the full
// standard threshold because their extra class restores the missing action
// economy.
export function partyThresholds(party: PartyMember[]): PartyThresholds {
  const totalWeight = party.reduce((s, p) => s + p.weight, 0);
  const isSolo = totalWeight <= 1.0001;

  const acc: PartyThresholds = { easy: 0, medium: 0, hard: 0, deadly: 0 };
  for (const p of party) {
    const lvl = Math.min(20, Math.max(1, Math.round(p.level)));
    const t = XP_THRESHOLDS[lvl];
    const soloPenalty = isSolo && !p.gestalt ? 0.75 : 1.0;
    const scale = p.weight * soloPenalty;
    acc.easy += t.easy * scale;
    acc.medium += t.medium * scale;
    acc.hard += t.hard * scale;
    acc.deadly += t.deadly * scale;
  }
  return {
    easy: Math.round(acc.easy),
    medium: Math.round(acc.medium),
    hard: Math.round(acc.hard),
    deadly: Math.round(acc.deadly),
  };
}

export type EncounterCombo = {
  cr: string;
  count: number;
  baseXP: number;
  multiplier: number;
  adjustedXP: number;
};

const CR_LIST: string[] = [
  '0', '1/8', '1/4', '1/2',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
  '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
];

// Suggest CR/count combinations whose adjusted XP lands inside [minXP, maxXP).
// Walks counts 1..maxCount; for each count, picks the CR (if any) whose
// adjusted XP is closest to the band's midpoint. Returns combos sorted by
// count so the user sees a spread of party-size options.
export function suggestCombosForBand(
  minXP: number,
  maxXP: number,
  opts: { maxCount?: number } = {},
): EncounterCombo[] {
  const maxCount = opts.maxCount ?? 12;
  if (!(maxXP > minXP)) return [];
  const mid = (minXP + maxXP) / 2;
  const out: EncounterCombo[] = [];

  for (let count = 1; count <= maxCount; count++) {
    const mult = encounterMultiplier(count);
    let best: EncounterCombo | null = null;
    let bestGap = Infinity;
    for (const cr of CR_LIST) {
      const baseXP = CR_TO_XP[cr];
      if (baseXP == null) continue;
      const adjustedXP = baseXP * count * mult;
      if (adjustedXP < minXP || adjustedXP >= maxXP) continue;
      const gap = Math.abs(adjustedXP - mid);
      if (gap < bestGap) {
        bestGap = gap;
        best = { cr, count, baseXP, multiplier: mult, adjustedXP };
      }
    }
    if (best) out.push(best);
  }
  return out;
}

export function suggestEncounters(
  thresholds: PartyThresholds,
): Record<Difficulty, EncounterCombo[]> {
  const bands: Record<Difficulty, [number, number]> = {
    easy: [thresholds.easy, thresholds.medium],
    medium: [thresholds.medium, thresholds.hard],
    hard: [thresholds.hard, thresholds.deadly],
    deadly: [thresholds.deadly, Math.round(thresholds.deadly * 1.5)],
  };
  return {
    easy: suggestCombosForBand(bands.easy[0], bands.easy[1]),
    medium: suggestCombosForBand(bands.medium[0], bands.medium[1]),
    hard: suggestCombosForBand(bands.hard[0], bands.hard[1]),
    deadly: suggestCombosForBand(bands.deadly[0], bands.deadly[1]),
  };
}

// Parse a level out of a free-form classLevel string. For multiclass entries
// like "Fighter 3 / Rogue 2" we sum the slash-separated chunks; for simple
// "Wizard 5" the lone number wins. Returns null if no digits are present.
export function parseLevelFromClassLevel(classLevel: string): number | null {
  if (!classLevel) return null;
  const nums = classLevel.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  if (classLevel.includes('/')) {
    const total = classLevel
      .split('/')
      .map((part) => {
        const m = part.match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .reduce((a, b) => a + b, 0);
    if (total > 0) return Math.min(20, total);
  }
  const max = nums.reduce((a, b) => Math.max(a, parseInt(b, 10)), 0);
  return max > 0 ? Math.min(20, max) : null;
}
