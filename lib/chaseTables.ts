// Chase complications and chase tracker types.
// Original content authored for this project.
// Terrain framework inspired by classic TTRPG chase mechanics.

export type Terrain = { id: string; label: string; note: string };

export const TERRAINS: Terrain[] = [
  { id: 'urban',      label: 'Urban',              note: 'City streets, alleys, rooftops, markets.' },
  { id: 'wilderness', label: 'Wilderness',         note: 'Forest, plains, hills, broken country.' },
  { id: 'dungeon',    label: 'Dungeon / Indoor',   note: 'Corridors, chambers, narrow passages.' },
  { id: 'coastal',    label: 'Coastal / Maritime', note: 'Docks, ships, harbors, tidal flats.' },
  { id: 'underwater', label: 'Underwater',         note: 'Currents, kelp, predators, pressure.' },
  { id: 'mounted',    label: 'Mounted',            note: 'On horseback or beast, road or open ground.' },
];

export const COMPLICATIONS: Record<string, string[]> = {
  urban: [
    'A large crowd is between the participant and their destination. Acrobatics or Athletics to push through; failure costs movement.',
    'A wagon, cart, or stall blocks the path. Acrobatics to vault it, Athletics to shove it aside, or detour around.',
    'A child or animal darts unexpectedly into the path. Dexterity save to avoid a collision.',
    'A window or shop awning the participant can use. Acrobatics to swing through; success grants extra movement.',
    'A guard or watchman shouts to halt. Persuasion, Deception, or Intimidation to keep moving without incident.',
    'A patrol stands directly in the path. Athletics to barrel through, Acrobatics to dodge around.',
    'A pile of crates, barrels, or refuse. Athletics to clear in one motion; failure means a slowed climb.',
    'A pickpocket or pickpurse seizes the moment. Sleight of Hand or Perception to notice; loss of an item on failure.',
    'A puddle of slick liquid or fresh mud. Acrobatics to avoid skidding; failure causes a prone fall.',
    'A passing carriage blocks an intersection. Time the gap (Dex check) or take the long way.',
    'A laundry line, rope, or wire across the path. Acrobatics to duck under at speed.',
    'A roof gap. Athletics for the jump; failure means falling onto an awning, into a stall, or to the street.',
    'A locked or stuck gate or door. Athletics to force, Sleight of Hand to pick, or detour.',
    'Stray dogs give chase, slowing or harrying the participant.',
    "A street performer's flames, knives, or animals are in the path. Dex save to weave through.",
    'A pile of slipping cobblestones, fish scales, or animal entrails. Acrobatics to keep footing.',
    'A bystander offers a helping hand into a hiding spot. Spend the turn to take it; gain a chance to break line of sight.',
    'A constable on horseback joins the chase from a side street.',
    'Falling roof tiles or chimney bricks rain into the path. Dex save to avoid damage.',
    'The participant rounds a corner and finds the chase has been cut off ahead. Reroute or stand and fight.',
  ],
  wilderness: [
    'A tangle of roots, brambles, or undergrowth. Athletics to push through or Acrobatics to weave.',
    'A swollen stream or river crossing the path. Athletics to swim or detour to a ford.',
    'A steep slope of loose scree or mud. Acrobatics to descend; failure means a sliding fall.',
    'A swarm of biting insects, snakes, or wasps. Con save to keep moving through them.',
    'A natural pit, ravine, or chasm requires a jump. Athletics or Acrobatics; failure means falling.',
    'A clearing the participant must cross with no cover. Stealth attempts impossible; ranged attacks possible from pursuers.',
    'A natural narrow passage between rocks. Single-file only; participant in the lead controls timing.',
    'A wild animal disturbs the chase — wolves, boar, snakes, bear, or worse.',
    'A fallen tree blocks the path. Athletics to climb over, Acrobatics to vault, or detour.',
    "Hunters' snares, deadfalls, or traps placed for other prey. Perception to spot; Dex save if missed.",
    'A patch of quicksand, deep mud, or marshland. Strength save to extricate, or detour.',
    'Sudden weather change — fog, rain, snow, dust. Visibility halved; chase becomes a pursuit by sound.',
    'A bog, swamp, or peat field where each step sinks. Speed reduced for the round.',
    'A clearing with a sheer drop on the far side. Whoever reaches it first must climb down (Athletics) or jump.',
    'A scout or sentry from the local population takes notice. Word will spread.',
    'A rockfall, mudslide, or natural hazard triggers from running movement.',
    'A wildlife stampede — deer, boar, livestock — crosses the path of the chase.',
    'A river or stream the participant can use for cover by going downstream. Strength to swim with current.',
    'A flock of birds erupts into flight, breaking line of sight briefly.',
    'A magical aura — fey crossing, wild magic zone, ley line — disrupts everyone in the area.',
  ],
  dungeon: [
    'A door stands closed in the path. Athletics to force, Sleight of Hand to pick, or check beside the door for a switch.',
    'A pressure plate triggers a trap as the participant crosses.',
    'A patrolling inhabitant of the dungeon stumbles into the participant.',
    'A spiral or steep staircase. Acrobatics to descend at speed; failure means a tumbling fall.',
    'A rope or chain hanging from above. Acrobatics to grab and swing; success grants distance.',
    'A flooded section of corridor, knee-deep or worse. Speed reduced.',
    'A magical effect — wild magic, lingering enchantment, alarm glyph — activates from passage.',
    'A drop into a lower level. Acrobatics to land safely, or take falling damage.',
    "A bottleneck forces single-file movement. Whoever's behind makes a Dex save to keep up.",
    'A previously-passed trap re-arms as the participant crosses back over it.',
    'A door slams shut behind the participant. Athletics to open; pursuers gain on the delay.',
    'A creature already in the dungeon decides this is a good moment to attack one of the parties.',
    'A magical light source — torch, sconce, glyph — gutters and the corridor goes dark.',
    'A familiar room mid-corridor offers a hiding spot. Stealth to slip in and break the chase.',
    'A pile of skeletal remains, broken furniture, or rubble. Acrobatics to vault at speed.',
  ],
  coastal: [
    'A loose plank, fishing net, or rope coil on a dock. Acrobatics to keep footing.',
    'A boat unmoored and drifting just out of reach. Athletics to make the leap or stay on the pier.',
    'A wave or surge slams across the deck or dock. Strength save to stay upright.',
    "A flock of seabirds erupts into the participant's path.",
    'A crane, pulley, or rigging in the way. Acrobatics to climb past or detour around.',
    'A barrel or crate rolls free across the dock or deck. Dex save to avoid being knocked prone.',
    'A wet, slippery surface from fish slime, spilled oil, or seawater. Acrobatics to keep footing.',
    'A sail or lantern catches and falls. Dex save to avoid the falling object.',
    'A length of dock or hull-plank gives way beneath the runner.',
    'A passing merchant captain shouts an offer of passage — for a price.',
  ],
  underwater: [
    "A strong current pushes against the participant's direction of travel. Athletics or Strength save to maintain speed.",
    'A kelp forest or coral maze. Stealth to slip through unseen, or Athletics to push through.',
    'A predator — eel, shark, octopus — circles into the chase from below.',
    "Bubbles released from the participant's movement give away position. Stealth becomes impossible briefly.",
    'A pressure shift — descending too fast — forces a Con save to avoid disorientation.',
    'A pocket of bad water (silt, blood, ink) reduces visibility to almost zero.',
    'A school of small creatures parts and reforms, providing brief concealment.',
    'A sunken object — wreck, structure, formation — offers cover for someone willing to stop swimming.',
  ],
  mounted: [
    'A low-hanging branch threatens to unseat the rider. Acrobatics or take damage.',
    'The mount stumbles, requires a check to keep it from going lame.',
    'A patch of broken ground — burrows, ruts, holes — forces a Wisdom (Handling) check.',
    'The mount becomes spooked by a sound, scent, or sight. Animal Handling to keep it under control.',
    'A jump over a fence, hedge, fallen tree, or low wall. Acrobatics or Athletics check.',
    'A river or ford crossing. Animal Handling to take the mount through it safely.',
    'A second rider — bandit, herald, pursuer — joins the chase from a side path.',
    'The mount throws a shoe or develops a limp; speed reduced unless dismounted.',
    'A wagon, herd, or convoy blocks the road. Detour adds time; cutting through hits open challenge.',
    'A swarm of stinging insects panics the mount. Animal Handling each round to keep going.',
  ],
};

// ---- Chase entities ----

export type ChaseSide = 'pursuer' | 'quarry';

export type Participant = {
  id: string;
  name: string;
  side: ChaseSide;
  speedMod: number;       // +/- to baseline speed (in "distance units")
  exhaustion: number;     // 0-6, classic exhaustion scale
  notes: string;
};

export type RoundEntry = {
  id: string;
  roundNumber: number;
  participantId: string | null; // null if it's a general round event
  participantName: string;
  complication: string;
  outcome: string;        // user-editable narrative outcome
};

export type Chase = {
  id: string;
  name: string;
  terrain: string;
  participants: Participant[];
  currentRound: number;
  gap: number;                  // distance between sides (positive = pursuer behind, 0 = caught, negative = quarry escaped)
  escapeGap: number;            // when gap hits this, quarry escapes
  catchGap: number;             // when gap hits this, pursuer catches
  rounds: RoundEntry[];
  notes: string;
  resolved: 'ongoing' | 'caught' | 'escaped' | 'aborted';
  createdAt: number;
  updatedAt: number;
};

// ---- Helpers ----

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function rollComplication(terrainId: string): string {
  const table = COMPLICATIONS[terrainId];
  if (!table) return COMPLICATIONS.urban[0];
  return pick(table);
}

export function newChase(terrainId = 'urban'): Chase {
  return {
    id: uid(),
    name: 'New Chase',
    terrain: terrainId,
    participants: [],
    currentRound: 1,
    gap: 6,           // default starting gap
    escapeGap: 12,
    catchGap: 0,
    rounds: [],
    notes: '',
    resolved: 'ongoing',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function newParticipant(side: ChaseSide = 'quarry'): Participant {
  return {
    id: uid(),
    name: '',
    side,
    speedMod: 0,
    exhaustion: 0,
    notes: '',
  };
}
