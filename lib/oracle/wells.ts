// The Wells Oracle — an original yes/no/and/but answer engine for solo and
// at-the-table improvisation. It is inspired by the *style* of Mythic-GME
// emergent play (a chaos factor that bends the odds, doubles that fire random
// events) but uses an ORIGINAL probability curve and ORIGINAL d100 event
// tables — none of Mythic's copyrighted Fate Chart numbers are reproduced.
//
// Pure + deterministic given Math.random; everything here is unit-tested in
// ./wells.test.ts against the probability ranges documented inline.

export type OracleOdds =
  | 'Certain'
  | 'NearlyCertain'
  | 'VeryLikely'
  | 'Likely'
  | 'FiftyFifty'
  | 'Unlikely'
  | 'VeryUnlikely'
  | 'NearlyImpossible'
  | 'Impossible';

export type OracleResult =
  | 'Exceptional Yes'
  | 'Yes, And'
  | 'Yes'
  | 'Yes, But'
  | 'No, But'
  | 'No'
  | 'No, And'
  | 'Exceptional No';

export type RandomEvent = { focus: string; action: string; subject: string };

export type OracleRoll = {
  id: string;
  question: string;
  odds: OracleOdds;
  chaosFactor: number; // 1-9
  roll: number; // 1-100
  threshold: number; // computed yes-threshold (5-95)
  result: OracleResult;
  randomEvent?: RandomEvent;
  timestamp: number;
};

// Display order + human labels for the nine odds levels (UI dropdown order).
export const ODDS_OPTIONS: ReadonlyArray<{ value: OracleOdds; label: string }> = [
  { value: 'Certain', label: 'Certain' },
  { value: 'NearlyCertain', label: 'Nearly Certain' },
  { value: 'VeryLikely', label: 'Very Likely' },
  { value: 'Likely', label: 'Likely' },
  { value: 'FiftyFifty', label: 'Fifty / Fifty' },
  { value: 'Unlikely', label: 'Unlikely' },
  { value: 'VeryUnlikely', label: 'Very Unlikely' },
  { value: 'NearlyImpossible', label: 'Nearly Impossible' },
  { value: 'Impossible', label: 'Impossible' },
];

// Base yes-threshold (out of 100) for each odds level at the neutral chaos
// factor of 5. Higher = more likely "Yes".
export const ODDS_TABLE: Record<OracleOdds, number> = {
  Certain: 90,
  NearlyCertain: 80,
  VeryLikely: 70,
  Likely: 60,
  FiftyFifty: 50,
  Unlikely: 40,
  VeryUnlikely: 30,
  NearlyImpossible: 20,
  Impossible: 10,
};

// Chaos shifts the threshold: a calm world (low chaos) resists the PCs'
// hopes, a chaotic one bends toward "yes". Symmetric around the neutral 5.
export const CHAOS_SHIFT: Record<number, number> = {
  1: -15,
  2: -10,
  3: -5,
  4: -2,
  5: 0,
  6: 2,
  7: 5,
  8: 10,
  9: 15,
};

export function makeOracleId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `oracle-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Clamp the final yes-threshold so even "Impossible" leaves a sliver of hope
// and even "Certain" keeps a sliver of doubt.
export function oracleThreshold(odds: OracleOdds, chaosFactor: number): number {
  const base = ODDS_TABLE[odds];
  const shift = CHAOS_SHIFT[chaosFactor] ?? 0;
  return Math.max(5, Math.min(95, base + shift));
}

export function askOracle(args: {
  question: string;
  odds: OracleOdds;
  chaosFactor: number;
}): Omit<OracleRoll, 'id' | 'timestamp'> {
  const roll = 1 + Math.floor(Math.random() * 100);
  const threshold = oracleThreshold(args.odds, args.chaosFactor);
  const isYes = roll <= threshold;

  let result: OracleResult;
  if (isYes) {
    // 0 = strongest yes (low roll), 1 = weakest yes (roll == threshold).
    const pos = roll / threshold;
    if (pos <= 0.1) result = 'Exceptional Yes';
    else if (pos <= 0.4) result = 'Yes, And';
    else if (pos >= 0.85) result = 'Yes, But';
    else result = 'Yes';
  } else {
    // 0 = barely no (just over threshold), 1 = strongest no (roll == 100).
    const pos = (roll - threshold) / (100 - threshold);
    if (pos >= 0.9) result = 'Exceptional No';
    else if (pos >= 0.6) result = 'No, And';
    else if (pos <= 0.15) result = 'No, But';
    else result = 'No';
  }

  // Random event fires on matching digits (doubles) whose value is within the
  // chaos factor — e.g. 33 fires at chaos 3+, 88 only at chaos 8+. Higher
  // chaos => events fire more often, exactly as emergent play intends.
  const tens = Math.floor(roll / 10);
  const ones = roll % 10;
  let randomEvent: RandomEvent | undefined;
  if (tens === ones && tens > 0 && tens <= args.chaosFactor) {
    randomEvent = rollRandomEvent();
  }

  return {
    question: args.question,
    odds: args.odds,
    chaosFactor: args.chaosFactor,
    roll,
    threshold,
    result,
    randomEvent,
  };
}

// Convenience wrapper that stamps an id + timestamp so the result can be
// pushed straight onto data.oracleLog.
export function rollOracle(args: {
  question: string;
  odds: OracleOdds;
  chaosFactor: number;
}): OracleRoll {
  return { ...askOracle(args), id: makeOracleId(), timestamp: Date.now() };
}

export function rollRandomEvent(): RandomEvent {
  return {
    focus: FOCUS_TABLE[Math.floor(Math.random() * FOCUS_TABLE.length)],
    action: ACTION_TABLE[Math.floor(Math.random() * ACTION_TABLE.length)],
    subject: SUBJECT_TABLE[Math.floor(Math.random() * SUBJECT_TABLE.length)],
  };
}

export function isYesResult(result: OracleResult): boolean {
  return result.startsWith('Yes') || result === 'Exceptional Yes';
}

// Roll a single scene complication (d20). Pure helper used by the modal's
// "Complicate Scene" button.
export function rollComplication(): { roll: number; complication: string } {
  const idx = Math.floor(Math.random() * COMPLICATION_TABLE.length);
  return { roll: idx + 1, complication: COMPLICATION_TABLE[idx] };
}

// --- Random Event Focus (d20) ----------------------------------------------
export const FOCUS_TABLE: readonly string[] = [
  'NPC Action', // 1
  'NPC Goal Advances', // 2
  'PC Setback', // 3
  'PC Boon', // 4
  'Progress Toward Goal', // 5
  'Setback From Goal', // 6
  'New NPC', // 7
  'Old NPC Returns', // 8
  'Faction Event', // 9
  'Faction Conflict', // 10
  'Location Shifts', // 11
  'Discovery', // 12
  'Complication', // 13
  'Surprise', // 14
  'Echo of the Past', // 15
  'Remote Event (News)', // 16
  'Time Passes', // 17
  'Magic Surfaces', // 18
  'PC Memory Surfaces', // 19
  'Ambiguous', // 20
];

// --- Action (d100) ---------------------------------------------------------
export const ACTION_TABLE: readonly string[] = [
  'Abandon', 'Accept', 'Accuse', 'Acquire', 'Aid', 'Ambush', 'Announce', 'Approach', 'Arrest', 'Arrive',
  'Ask', 'Assault', 'Avoid', 'Bargain', 'Beg', 'Betray', 'Block', 'Bond', 'Break', 'Bribe',
  'Build', 'Burn', 'Buy', 'Capture', 'Celebrate', 'Challenge', 'Change', 'Charge', 'Cheat', 'Choose',
  'Claim', 'Collapse', 'Confess', 'Confront', 'Conspire', 'Construct', 'Consume', 'Corrupt', 'Cure', 'Damage',
  'Deceive', 'Defend', 'Deliver', 'Demand', 'Destroy', 'Disappear', 'Discover', 'Disguise', 'Distract', 'Doubt',
  'Dream', 'Embrace', 'Emerge', 'Escape', 'Expose', 'Fail', 'Fall', 'Fight', 'Find', 'Flee',
  'Forge', 'Forgive', 'Frighten', 'Gather', 'Give', 'Grieve', 'Guard', 'Guide', 'Haunt', 'Heal',
  'Hide', 'Hunt', 'Imprison', 'Inspire', 'Insult', 'Investigate', 'Judge', 'Kill', 'Leave', 'Learn',
  'Lie', 'Locate', 'Lose', 'Move', 'Negotiate', 'Observe', 'Offer', 'Open', 'Plead', 'Possess',
  'Promise', 'Protect', 'Pursue', 'Question', 'Reach', 'Reject', 'Release', 'Remember', 'Repair', 'Reveal',
];

// --- Subject (d100) --------------------------------------------------------
export const SUBJECT_TABLE: readonly string[] = [
  'Allies', 'Ancient Pact', 'Artifact', 'Authority', 'Banner', 'Bargain', 'Beast', 'Belief', 'Betrayal', 'Bone',
  'Boundary', 'Bridge', 'Captive', 'Caravan', 'Child', 'Choice', 'Coin', 'Compass', 'Council', 'Court',
  'Crown', 'Curse', 'Custom', 'Death', 'Debt', 'Decision', 'Deed', 'Demon', 'Disease', 'Doorway',
  'Dream', 'Duel', 'Echo', 'Edge', 'Elder', 'Enemy', 'Family', 'Fate', 'Father', 'Fear',
  'Feast', 'Fire', 'Flag', 'Forest', 'Friend', 'Future', 'Garden', 'Ghost', 'Gift', 'Glass',
  'Gold', 'Grief', 'Guild', 'Harvest', 'Heir', 'Heretic', 'Home', 'Honor', 'Hunger', 'Illness',
  'Innocence', 'Iron', 'Journey', 'Judgment', 'Key', 'Knowledge', 'Law', 'Letter', 'Library', 'Light',
  'Lock', 'Magic', 'Mask', 'Memory', 'Merchant', 'Message', 'Monster', 'Mother', 'Mountain', 'Name',
  'Night', 'Oath', 'Outsider', 'Pact', 'Past', 'Path', 'People', 'Plague', 'Power', 'Prayer',
  'Priest', 'Prison', 'Promise', 'Prophecy', 'Protector', 'Quest', 'Rebel', 'Relic', 'Ring', 'River',
];

// --- Scene Complication (d20) ----------------------------------------------
export const COMPLICATION_TABLE: readonly string[] = [
  'Time pressure: something will happen in N rounds if unresolved', // 1
  'An unexpected witness arrives', // 2
  'Environmental hazard intensifies (fire, flood, cold, heat)', // 3
  'Equipment failure: something the PC relies on breaks', // 4
  'A hidden ally reveals themselves', // 5
  'A hidden enemy reveals themselves', // 6
  'An NPC present switches sides', // 7
  'Magic surges briefly — a small inexplicable effect', // 8
  'A resource runs low (light, water, ammunition, time)', // 9
  'False information surfaces: something the PC believed is wrong', // 10
  'An NPC reveals a hidden agenda', // 11
  'Backup arrives for the antagonist', // 12
  'A previous decision returns to bite', // 13
  'A civilian or innocent becomes endangered', // 14
  'Architectural failure: floor, ceiling, wall, or bridge gives way', // 15
  'Two threats merge into one larger threat', // 16
  'Useful information is misplaced, destroyed, or stolen', // 17
  'An honor compromise: the PC must choose between two held values', // 18
  'An old debt is called in at the worst moment', // 19
  "An echo from the PC's past arrives in physical form", // 20
];
