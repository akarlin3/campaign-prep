// Tasha's Cauldron of Everything — Sidekicks (pp. 142–149)
// Class-table data summarized for prefill. The text in the resulting character
// `features` block is a concise summary; players should consult the book for
// exact wording.

export type SidekickClass = 'expert' | 'spellcaster' | 'warrior';
export type SpellList = 'mage' | 'healer' | 'prodigy';
export type SidekickBaseId =
  | 'commoner'
  | 'guard'
  | 'bandit'
  | 'acolyte'
  | 'scout'
  | 'tribal-warrior';

export type SidekickClassInfo = {
  id: SidekickClass;
  name: string;
  hitDie: 6 | 8 | 10;
  saves: string;
  blurb: string;
};

export const SIDEKICK_CLASSES: SidekickClassInfo[] = [
  {
    id: 'expert',
    name: 'Expert',
    hitDie: 8,
    saves: 'Dexterity, Intelligence',
    blurb: 'A skill-monkey companion — scouts, bards, rogues, sages.',
  },
  {
    id: 'spellcaster',
    name: 'Spellcaster',
    hitDie: 6,
    saves: 'Wisdom, Charisma',
    blurb: 'A magical companion — wizard, cleric, or bardic flavor.',
  },
  {
    id: 'warrior',
    name: 'Warrior',
    hitDie: 10,
    saves: 'Strength, Constitution',
    blurb: 'A frontline fighter — guards, knights, barbarians.',
  },
];

export type SpellListInfo = {
  id: SpellList;
  name: string;
  ability: 'Intelligence' | 'Wisdom' | 'Charisma';
  abilityAbbrev: 'Int' | 'Wis' | 'Cha';
  list: string;
  blurb: string;
};

export const SPELL_LISTS: SpellListInfo[] = [
  {
    id: 'mage',
    name: 'Mage',
    ability: 'Intelligence',
    abilityAbbrev: 'Int',
    list: 'Wizard',
    blurb: 'Arcane caster. Cantrips and spells from the Wizard list.',
  },
  {
    id: 'healer',
    name: 'Healer',
    ability: 'Wisdom',
    abilityAbbrev: 'Wis',
    list: 'Cleric',
    blurb: 'Divine caster. Cantrips and spells from the Cleric list.',
  },
  {
    id: 'prodigy',
    name: 'Prodigy',
    ability: 'Charisma',
    abilityAbbrev: 'Cha',
    list: 'Bard',
    blurb: 'Versatile caster. Cantrips and spells from the Bard list.',
  },
];

export type BaseCreature = {
  id: SidekickBaseId;
  name: string;
  abilities: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  baseAC: number;
  acNote: string;
  speed: string;
  skills: string;
  languages: string;
  equipment: string;
  notes: string;
};

// Common CR ≤ 1/2 stat blocks suitable as sidekick bases (Monster Manual / SRD).
export const BASE_CREATURES: BaseCreature[] = [
  {
    id: 'commoner',
    name: 'Commoner',
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    baseAC: 10,
    acNote: 'no armor',
    speed: '30 ft',
    skills: '',
    languages: 'Common',
    equipment: 'Club',
    notes: 'A baseline civilian. CR 0.',
  },
  {
    id: 'guard',
    name: 'Guard',
    abilities: { str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10 },
    baseAC: 16,
    acNote: 'chain shirt, shield',
    speed: '30 ft',
    skills: 'Perception +2',
    languages: 'Common',
    equipment: 'Chain shirt, shield, spear, light crossbow',
    notes: 'Town watch / militia. CR 1/8.',
  },
  {
    id: 'bandit',
    name: 'Bandit',
    abilities: { str: 11, dex: 12, con: 12, int: 10, wis: 10, cha: 10 },
    baseAC: 12,
    acNote: 'leather armor',
    speed: '30 ft',
    skills: '',
    languages: 'Common',
    equipment: 'Leather armor, scimitar, light crossbow with 20 bolts',
    notes: 'Rough-and-ready highwayman. CR 1/8.',
  },
  {
    id: 'acolyte',
    name: 'Acolyte',
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 14, cha: 11 },
    baseAC: 10,
    acNote: 'robes',
    speed: '30 ft',
    skills: 'Medicine +4, Religion +2',
    languages: 'Common',
    equipment: 'Holy symbol, robes',
    notes: 'Junior temple servant. CR 1/4.',
  },
  {
    id: 'scout',
    name: 'Scout',
    abilities: { str: 11, dex: 14, con: 12, int: 11, wis: 13, cha: 11 },
    baseAC: 13,
    acNote: 'leather armor',
    speed: '30 ft',
    skills: 'Nature +4, Perception +5, Stealth +6, Survival +5',
    languages: 'Common',
    equipment: 'Leather armor, shortsword, longbow with 20 arrows',
    notes: 'Tracker / ranger. CR 1/2.',
  },
  {
    id: 'tribal-warrior',
    name: 'Tribal Warrior',
    abilities: { str: 13, dex: 11, con: 12, int: 8, wis: 11, cha: 8 },
    baseAC: 12,
    acNote: 'hide armor',
    speed: '30 ft',
    skills: '',
    languages: 'one local dialect',
    equipment: 'Hide armor, spear',
    notes: 'Clan fighter. CR 1/8.',
  },
];

export function getClassInfo(id: SidekickClass): SidekickClassInfo {
  return SIDEKICK_CLASSES.find((c) => c.id === id) ?? SIDEKICK_CLASSES[0];
}

export function getSpellListInfo(id: SpellList): SpellListInfo {
  return SPELL_LISTS.find((l) => l.id === id) ?? SPELL_LISTS[0];
}

export function getBaseCreature(id: SidekickBaseId): BaseCreature {
  return BASE_CREATURES.find((b) => b.id === id) ?? BASE_CREATURES[0];
}

// Proficiency bonus per character level (standard 5e progression).
export function proficiencyBonus(level: number): number {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
}

// Ability modifier from a score.
export function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Hit point total for a sidekick at the given level.
// Level 1: HD_max + Con mod (min 1).
// Each level after: average of HD + Con mod (min 1 per level).
export function sidekickHp(hitDie: number, conMod: number, level: number): number {
  const lvl = Math.max(1, Math.min(20, level));
  const avg = Math.floor(hitDie / 2) + 1; // d6→4, d8→5, d10→6
  let total = hitDie + conMod;
  if (total < 1) total = 1;
  for (let i = 2; i <= lvl; i++) {
    const inc = Math.max(1, avg + conMod);
    total += inc;
  }
  return total;
}

// Spell slots known by a Spellcaster sidekick at the given level
// (matches the standard full-caster slot table).
const SPELL_SLOTS: number[][] = [
  // [L1, L2, L3, L4, L5, L6, L7, L8, L9]
  [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1
  [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2
  [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3
  [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4
  [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5
  [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6
  [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7
  [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8
  [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9
  [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11
  [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13
  [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15
  [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // 20
];

export function spellSlotsAtLevel(level: number): number[] {
  const lvl = Math.max(1, Math.min(20, level));
  return SPELL_SLOTS[lvl - 1];
}

export function formatSlots(level: number): string {
  return spellSlotsAtLevel(level)
    .map((n, i) => (n > 0 ? `L${i + 1}: ${n}` : null))
    .filter(Boolean)
    .join(', ');
}

// Cantrips known per level (sidekick spellcaster).
export function cantripsKnown(level: number): number {
  if (level >= 10) return 5;
  if (level >= 4) return 4;
  return 3;
}

// Spells known per level (sidekick spellcaster — Tasha, summary).
const SPELLS_KNOWN: Record<number, number> = {
  1: 4, 2: 5, 3: 6, 4: 7, 5: 8,
  6: 9, 7: 10, 8: 11, 9: 12, 10: 13,
  11: 13, 12: 14, 13: 14, 14: 15, 15: 15,
  16: 16, 17: 16, 18: 17, 19: 17, 20: 18,
};

export function spellsKnownAtLevel(level: number): number {
  return SPELLS_KNOWN[Math.max(1, Math.min(20, level))] ?? 0;
}

// Per-class feature progression (summarized). Each entry is the feature
// gained at that level. ASI = Ability Score Improvement.
type Feature = { name: string; text: string };

const EXPERT_FEATURES: Record<number, Feature[]> = {
  1: [
    { name: 'Bonus Proficiencies', text: 'Gain proficiency in two skills of your choice and one tool or musical instrument.' },
    { name: 'Helpful', text: 'You can take the Help action as a bonus action. When you take the Help action, the creature you help can move up to half its speed as part of that help.' },
  ],
  2: [
    { name: 'Cunning Action', text: 'You can take the Dash, Disengage, or Hide action as a bonus action on each of your turns.' },
  ],
  3: [
    { name: 'Expertise', text: 'Choose two of your skill or tool proficiencies; your proficiency bonus is doubled for any ability check you make that uses either.' },
  ],
  4: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1 (max 20). May take a feat instead (DM permission).' }],
  5: [{ name: 'Coordinated Strike', text: 'When you take the Attack action, one friendly creature within 30 ft that can see or hear you can use its reaction to make one weapon attack.' }],
  6: [{ name: 'Quick Thinking', text: 'Initiative gains a bonus equal to your Charisma modifier (minimum +1).' }],
  7: [{ name: 'Reliable Talent', text: 'Whenever you make an ability check using a proficiency, treat a d20 roll of 9 or lower as 10.' }],
  8: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  10: [{ name: 'Expertise', text: 'Choose two more skill or tool proficiencies to double your proficiency bonus on.' }],
  12: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  16: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  19: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
};

const WARRIOR_FEATURES: Record<number, Feature[]> = {
  1: [
    { name: 'Bonus Proficiencies', text: 'Gain proficiency with two martial weapons of your choice and with shields if you do not already have it.' },
    {
      name: 'Martial Role',
      text:
        'Choose Defender or Striker. ' +
        'Defender — when you take the Attack action, use a bonus action to choose a creature within 5 ft; until the start of your next turn, attack rolls against allies other than you from that creature have disadvantage if you can see the creature. ' +
        'Striker — once per turn when you hit with a weapon attack, deal extra damage equal to half your sidekick level (rounded up) of the weapon\'s damage type.',
    },
  ],
  2: [{ name: 'Second Wind', text: 'Once per short or long rest, use a bonus action to regain hit points equal to 1d10 + your sidekick level.' }],
  3: [{ name: 'Improved Critical', text: 'Your weapon attacks score a critical hit on a roll of 19 or 20.' }],
  4: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  5: [{ name: 'Extra Attack', text: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' }],
  6: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  9: [{ name: 'Indomitable (1/long rest)', text: 'You can reroll a saving throw you fail; you must use the new roll.' }],
  11: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  13: [{ name: 'Indomitable (2/long rest)', text: 'Use Indomitable twice between long rests.' }],
  16: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  17: [{ name: 'Indomitable (3/long rest)', text: 'Use Indomitable three times between long rests.' }],
  19: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  20: [{ name: 'Survivor', text: 'At the start of each of your turns, regain hit points equal to 5 + your Constitution modifier if you have no more than half your hit points left. You don\'t gain this benefit if you have 0 hit points.' }],
};

const SPELLCASTER_FEATURES: Record<number, Feature[]> = {
  1: [
    { name: 'Spellcasting', text: 'You can cast spells from your chosen spell list (Mage / Healer / Prodigy). See Spells & Slots fields for current totals.' },
    { name: 'Bonus Proficiency', text: 'Gain proficiency in one skill from Arcana, History, Insight, Investigation, Medicine, Performance, Persuasion, or Religion.' },
  ],
  2: [{ name: 'Cantrip Versatility', text: 'When you finish a long rest, you can replace one cantrip you know with another from your spell list.' }],
  3: [{ name: 'Empowered Spells', text: 'When you roll damage for a spell, you can add your spellcasting ability modifier (minimum +1) to one damage roll of that spell. You can use this feature a number of times equal to your spellcasting ability modifier (minimum once), regaining all uses on a long rest.' }],
  4: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  5: [{ name: 'Potent Cantrips', text: 'When a creature succeeds on a saving throw against a cantrip you cast, it takes half the cantrip\'s damage (if any) but suffers no additional effect.' }],
  8: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  10: [{ name: 'Empowered Cantrips', text: 'Add your spellcasting ability modifier to one damage roll of any cantrip you cast.' }],
  12: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  16: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
  19: [{ name: 'Ability Score Improvement', text: 'Increase one ability by 2 or two abilities by 1.' }],
};

function featuresUpTo(table: Record<number, Feature[]>, level: number): string {
  const lines: string[] = [];
  for (let l = 1; l <= level; l++) {
    const feats = table[l];
    if (!feats) continue;
    for (const f of feats) {
      lines.push(`${f.name} (Lv ${l}). ${f.text}`);
    }
  }
  return lines.join('\n');
}

export function classFeaturesText(
  classId: SidekickClass,
  level: number,
  spellList: SpellList | '',
): string {
  const table =
    classId === 'expert' ? EXPERT_FEATURES
      : classId === 'warrior' ? WARRIOR_FEATURES
        : SPELLCASTER_FEATURES;
  let text = featuresUpTo(table, level);
  if (classId === 'spellcaster' && spellList) {
    const list = getSpellListInfo(spellList as SpellList);
    text =
      `Spell List: ${list.name} — draws from the ${list.list} spell list. ` +
      `Spellcasting Ability: ${list.ability}.\n\n` +
      text;
  }
  text += '\n\n[Summary only — see Tasha\'s Cauldron of Everything pp. 142–149 for full text.]';
  return text;
}

// Compute a starting equipment string (base creature + class kit).
function classKit(classId: SidekickClass): string {
  if (classId === 'warrior') return 'Shield, martial weapon of choice';
  if (classId === 'expert') return 'Thieves\' tools, chosen instrument or tool';
  return 'Spellcasting focus, component pouch';
}

export type SidekickPrefill = {
  race: string;
  classLevel: string;
  background: string;
  abilities: { str: string; dex: string; con: string; int: string; wis: string; cha: string };
  saves: string;
  ac: string;
  hp: string;
  hpMax: string;
  initiative: string;
  speed: string;
  profBonus: string;
  hitDice: string;
  skills: string;
  languages: string;
  proficiencies: string;
  equipment: string;
  features: string;
  spellcasting: { ability: string; saveDC: string; attackBonus: string; slots: string };
  spells: string;
  notes: string;
};

// Build the prefill values for a (class, level, spellList, base) combo.
export function buildSidekickPrefill(args: {
  classId: SidekickClass;
  level: number;
  spellList: SpellList | '';
  baseId: SidekickBaseId;
}): SidekickPrefill {
  const cls = getClassInfo(args.classId);
  const base = getBaseCreature(args.baseId);
  const lvl = Math.max(1, Math.min(20, args.level));

  const a = base.abilities;
  const conMod = abilityMod(a.con);
  const dexMod = abilityMod(a.dex);
  const pb = proficiencyBonus(lvl);
  const hp = sidekickHp(cls.hitDie, conMod, lvl);

  const abilityStr = (score: number) => {
    const mod = abilityMod(score);
    const sign = mod >= 0 ? '+' : '';
    return `${score} (${sign}${mod})`;
  };

  const className = (() => {
    if (args.classId === 'spellcaster' && args.spellList) {
      const list = getSpellListInfo(args.spellList as SpellList);
      return `${cls.name} (${list.name})`;
    }
    return cls.name;
  })();

  let spellcasting = { ability: '', saveDC: '', attackBonus: '', slots: '' };
  let spells = '';
  if (args.classId === 'spellcaster' && args.spellList) {
    const list = getSpellListInfo(args.spellList as SpellList);
    const castMod = abilityMod(a[list.abilityAbbrev.toLowerCase() as keyof typeof a]);
    const dc = 8 + pb + castMod;
    const atk = pb + castMod;
    const sign = atk >= 0 ? '+' : '';
    spellcasting = {
      ability: list.abilityAbbrev,
      saveDC: String(dc),
      attackBonus: `${sign}${atk}`,
      slots: formatSlots(lvl),
    };
    spells = `Cantrips known: ${cantripsKnown(lvl)}\nSpells known: ${spellsKnownAtLevel(lvl)}\n\n(Pick from the ${list.list} spell list.)`;
  }

  const initSign = dexMod >= 0 ? '+' : '';
  const pbSign = pb >= 0 ? '+' : '';

  return {
    race: 'Human',
    classLevel: `${className} ${lvl}`,
    background: base.name,
    abilities: {
      str: abilityStr(a.str),
      dex: abilityStr(a.dex),
      con: abilityStr(a.con),
      int: abilityStr(a.int),
      wis: abilityStr(a.wis),
      cha: abilityStr(a.cha),
    },
    saves: cls.saves,
    ac: String(base.baseAC),
    hp: String(hp),
    hpMax: String(hp),
    initiative: `${initSign}${dexMod}`,
    speed: base.speed,
    profBonus: `${pbSign}${pb}`,
    hitDice: `${lvl}d${cls.hitDie}`,
    skills: base.skills,
    languages: base.languages,
    proficiencies: `Saves: ${cls.saves}. ${base.acNote ? `Armor: ${base.acNote}. ` : ''}${classKit(args.classId)}`,
    equipment: [base.equipment, classKit(args.classId)].filter(Boolean).join('\n'),
    features: classFeaturesText(args.classId, lvl, args.spellList),
    spellcasting,
    spells,
    notes: `Sidekick (Tasha's Cauldron of Everything). Base stat block: ${base.name} (${base.notes}).`,
  };
}
