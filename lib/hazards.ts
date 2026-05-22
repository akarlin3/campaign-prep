// Environmental hazard math for 5e adjudication.
//
// All functions are pure. Conversions favor SI-ish units (meters, kilograms,
// seconds, joules) because 5e's "1d6 per 10 ft" abstractions become wildly
// inconsistent for boulders, falling rocks, or improvised explosives. We
// expose raw physics so a DM can sanity-check before applying the 5e cap.

export const G = 9.81; // m/s^2

export function feetToMeters(ft: number): number {
  return ft * 0.3048;
}
export function metersToFeet(m: number): number {
  return m / 0.3048;
}
export function poundsToKg(lb: number): number {
  return lb * 0.45359237;
}

// Falling damage (5e): 1d6 per 10 ft, max 20d6. Average die = 3.5.
export function fallingDamage5e(distanceFt: number): {
  dice: number;
  averageDamage: number;
  capped: boolean;
} {
  const raw = Math.max(0, Math.floor(distanceFt / 10));
  const dice = Math.min(20, raw);
  return {
    dice,
    averageDamage: dice * 3.5,
    capped: raw > 20,
  };
}

// Terminal velocity in m/s for typical humanoid (rough): ~55 m/s. Most table
// rulings should ignore this for cinematic falls, but it matters for tall
// drops where 5e's 200-ft cap is the only friction.
export function fallingVelocityMs(distanceFt: number, terminalMs = 55): number {
  const v = Math.sqrt(2 * G * feetToMeters(distanceFt));
  return Math.min(v, terminalMs);
}

// Kinetic energy from a falling object: KE = 1/2 m v^2.
// Returns joules and a *suggested* 5e dice rating mapped to severity.
export function fallingObjectDamage(params: {
  weightLb: number;
  fallFt: number;
}): {
  velocityMs: number;
  energyJ: number;
  suggestedDice: string;
  reasoning: string;
} {
  const v = fallingVelocityMs(params.fallFt);
  const m = poundsToKg(params.weightLb);
  const energyJ = 0.5 * m * v * v;
  // Rough mapping anchored to 5e: a falling humanoid (~75 kg) at 30 ft hits
  // ~3-4d6 (10.5-14 avg) ≈ 1.6 kJ. Use that as a calibration point.
  // We map every doubling of energy to roughly +2d6, capped at 20d6.
  const refJ = 1600;
  const refDice = 4;
  let dice = refDice;
  if (energyJ > 0) {
    const ratio = energyJ / refJ;
    dice = Math.round(refDice * Math.log2(ratio + 1) + refDice / 2);
  }
  dice = Math.max(1, Math.min(20, dice));
  const reasoning =
    energyJ < 200 ? 'Glancing — likely no damage, just knockdown.'
    : energyJ < 800 ? 'Bruising — single die at most.'
    : energyJ < 3000 ? 'Solid hit — moderate dice.'
    : energyJ < 15000 ? 'Severe — large dice block.'
    : 'Catastrophic — cap and consider instant downing.';
  return {
    velocityMs: v,
    energyJ,
    suggestedDice: `${dice}d6`,
    reasoning,
  };
}

// Blast radius (5e fireball is 20 ft sphere). For improvised explosives we
// estimate radius from TNT-equivalent mass via the cube-root law:
// R ≈ Z * W^(1/3), where Z is a damage-scaled constant. We pick Z so that
// 1 kg TNT yields the canonical fireball-ish 6m (~20 ft) lethal radius.
export function blastRadiusFt(tntKg: number, severity: 'lethal' | 'injurious' | 'window' = 'lethal'): number {
  const z = severity === 'lethal' ? 6 : severity === 'injurious' ? 11 : 25;
  const rM = z * Math.cbrt(Math.max(0, tntKg));
  return metersToFeet(rM);
}

// Occlusion: if cover covers fraction `c` of the line-of-effect cone, scale
// damage by (1 - c). 5e cover gives binary half/three-quarter/full, so we
// also return the nearest 5e bucket.
export function blastOcclusion(coverFraction: number): {
  damageMultiplier: number;
  bucket: 'none' | 'half' | 'three-quarters' | 'full';
} {
  const c = Math.max(0, Math.min(1, coverFraction));
  const damageMultiplier = 1 - c;
  const bucket =
    c < 0.15 ? 'none'
    : c < 0.55 ? 'half'
    : c < 0.95 ? 'three-quarters'
    : 'full';
  return { damageMultiplier, bucket };
}

// Material yield strengths (MPa) for very rough structural-integrity calls.
// Damage HP per 5 ft cube is from DMG p.246-ish; we extend it with real
// material data so the DM can compare "is this granite or sandstone?".
export type Material = {
  id: string;
  label: string;
  /** Compressive strength in MPa. Higher = harder to crack. */
  compressiveMpa: number;
  /** Reference HP per 5-ft cube (5e DMG/Xanathar). */
  hpPer5ftCube: number;
  ac: number;
};

export const MATERIALS: Material[] = [
  { id: 'paper',    label: 'Paper / Cloth',  compressiveMpa: 0.5,  hpPer5ftCube: 5,   ac: 11 },
  { id: 'glass',    label: 'Glass',          compressiveMpa: 50,   hpPer5ftCube: 18,  ac: 13 },
  { id: 'ice',      label: 'Ice',            compressiveMpa: 10,   hpPer5ftCube: 27,  ac: 13 },
  { id: 'wood',     label: 'Wood',           compressiveMpa: 40,   hpPer5ftCube: 90,  ac: 15 },
  { id: 'stone',    label: 'Stone',          compressiveMpa: 120,  hpPer5ftCube: 270, ac: 17 },
  { id: 'iron',     label: 'Iron',           compressiveMpa: 200,  hpPer5ftCube: 540, ac: 19 },
  { id: 'adamantine',label:'Adamantine',     compressiveMpa: 500,  hpPer5ftCube: 900, ac: 23 },
];

// Structural failure: a load-bearing block holding `loadKg` against a column
// of cross-section `areaM2` of `mat` fails when stress > ~30% of compressive
// strength (engineering safety factor ≈ 3).
export function structuralFailure(params: {
  loadKg: number;
  areaM2: number;
  material: Material;
}): { stressMpa: number; safetyMargin: number; failing: boolean } {
  const stressPa = (params.loadKg * G) / Math.max(1e-6, params.areaM2);
  const stressMpa = stressPa / 1e6;
  const yieldMpa = params.material.compressiveMpa * 0.33;
  const safetyMargin = yieldMpa / Math.max(0.0001, stressMpa);
  return {
    stressMpa,
    safetyMargin,
    failing: stressMpa > yieldMpa,
  };
}
