// Dungeon tables — ORIGINAL CONTENT.
//
// Source / licensing: no DMG content. Room contents, dressing, hazards, and
// theme-keyed inhabitant pools are original prose. Inhabitant names reference
// generic creature archetypes (skeleton, goblin, ghoul, etc.) which appear
// in SRD 5.1, but no SRD stat blocks or descriptions are copied.

import type { DungeonResult } from '../types';

export type DungeonTheme =
  | 'ruin'
  | 'lair'
  | 'tomb'
  | 'stronghold'
  | 'temple'
  | 'cave'
  | 'sewer'
  | 'manor'
  | 'mine'
  | 'ship'
  | 'woods'
  | 'swamp'
  | 'mountain'
  | 'frozen'
  | 'city';
export type DungeonSize = 'small' | 'medium' | 'large' | 'sprawling';
export type DungeonChallengeTier = '0-4' | '5-10' | '11-16' | '17+';

// Indoor themes use enclosed-space prose (doors, corridors, ceilings).
// Outdoor themes use open-air prose (paths, clearings, slopes).
export type DungeonSiteCategory = 'indoor' | 'outdoor';

export const THEME_CATEGORY: Record<DungeonTheme, DungeonSiteCategory> = {
  ruin: 'indoor',
  lair: 'indoor',
  tomb: 'indoor',
  stronghold: 'indoor',
  temple: 'indoor',
  cave: 'indoor',
  sewer: 'indoor',
  manor: 'indoor',
  mine: 'indoor',
  ship: 'indoor',
  woods: 'outdoor',
  swamp: 'outdoor',
  mountain: 'outdoor',
  frozen: 'outdoor',
  city: 'outdoor',
};

export const SIZE_TO_ROOM_COUNT: Record<DungeonSize, number> = {
  small: 5,
  medium: 10,
  large: 20,
  sprawling: 40,
};

export const THEME_NAME_PREFIXES: Record<DungeonTheme, readonly string[]> = {
  ruin: ['Broken', 'Lost', 'Toppled', 'Drowned', 'Burnt', 'Mossbound', 'Shattered', 'Forgotten', 'Fallen', 'Ruined', 'Crumbling', 'Silent'],
  lair: ['Den of', 'Lair of', 'Warren of', 'Hollow of', 'Pit of', 'Cave of', 'Nest of', 'Roost of', 'Hiding Place of', 'Refuge of'],
  tomb: ['Crypt of', 'Tomb of', 'Catacombs of', 'Bone-House of', 'Mausoleum of', 'Sepulcher of', 'Grave of', 'Barrow of', 'Resting Place of', 'Shrine of'],
  stronghold: ['Keep of', 'Fortress of', 'Citadel of', 'Bastion of', 'Hold of', 'Castle of', 'Tower of', 'Redoubt of', 'Garrison of', 'Outpost of'],
  temple: ['Temple of', 'Sanctum of', 'Cloister of', 'Chapel of', 'Vow-House of', 'Shrine of', 'Abbey of', 'Cathedral of', 'Monastery of', 'Tabernacle of'],
  cave: ['Caverns of', 'Mouths of', 'Black-Throat of', 'Belly of', 'Wormways of', 'Grotto of', 'Depths of', 'Chasm of', 'Fissure of', 'Caves of'],
  sewer: ['Drains of', 'Underway of', 'Gutter-Run of', 'Pipes of', 'Sluice of', 'Cisterns of', 'Aqueducts of', 'Channels of', 'Culverts of', 'Tunnels of'],
  manor: ['Manor of', 'House of', 'Estate of', 'Halls of', 'Wings of', 'Lodge of', 'Villa of', 'Mansion of', 'Chateau of', 'Palace of'],
  mine: ['Mines of', 'Shafts of', 'Diggings of', 'Quarry of', 'Galleries of', 'Lode of', 'Excavation of', 'Pits of', 'Tunnels of', 'Vein of'],
  ship: ['Wreck of', 'Hulk of', 'Sloop of', 'Brigantine of', 'Galley of', 'Black Sail of', 'Galleon of', 'Caravel of', 'Clipper of', 'Vessel of'],
  woods: ['Wildwood of', 'Greenwood of', 'Tangled Wood of', 'Shadow-Wood of', 'Hollow of', 'Thicket of', 'Forest of', 'Copse of', 'Grove of', 'Timber of'],
  swamp: ['Mire of', 'Fen of', 'Bog of', 'Drowned Reach of', 'Sodden Vale of', 'Slough of', 'Marsh of', 'Morass of', 'Quagmire of', 'Wetlands of'],
  mountain: ['Pass of', 'Spine of', 'Crag of', 'Ridge of', 'Saddle of', 'Cleft of', 'Peak of', 'Summit of', 'Cliffs of', 'Heights of'],
  frozen: ['Glacier of', 'Frostspine of', 'Ice-Veil of', 'Whitewatch of', 'Hoarfrost of', 'Frozen Halls of', 'Ice-Caves of', 'Tundra of', 'Snow-Drifts of', 'Chill of'],
  city: ['Streets of', 'Quarter of', 'District of', 'Slums of', 'Undermarkets of', 'Backways of', 'Alleys of', 'Wards of', 'Precinct of', 'Blocks of'],
};

export const THEME_NAME_SUFFIXES: Record<DungeonTheme, readonly string[]> = {
  ruin: ['the Old Hold', 'Hex Tower', 'the Vine-Choked Court', 'Salt-Bell Keep', 'the Sunken Causeway', 'the Shattered Keep', 'the Fallen Spire', 'the Crumbling Wall', 'the Lost City', 'the Ancient Throne'],
  lair: ['the Iron-Tooth', 'the Long-Tail', 'the Mossback', 'the Pale Singer', 'the Night-Eyed Mother', 'the Shadow-Beast', 'the Scaled Terror', 'the Winged Horror', 'the Great Bear', 'the Pack Lord'],
  tomb: ['the Mended Saint', 'Bell-Throat the King', 'the Twin Sisters', 'Lord Halse', 'the Last Heralds', 'the Forgotten King', 'the Nameless Queen', 'the Silent Monks', 'the Blind Seer', 'the Honored Dead'],
  stronghold: ['the Burnt Marshal', 'the Eight Banners', 'the Crooked Crown', 'the Bone-Light', 'Iron Vigil', 'the Black Guard', 'the Silver Shield', 'the Broken Sword', 'the Red Eagle', 'the Stone Lions'],
  temple: ['the Listening God', 'the Lamp-Bearer', 'the Empty Throne', 'the Quiet Hour', 'the Mended Veil', 'the Weeping Saint', 'the Golden Idol', 'the Silver Moon', 'the Black Sun', 'the Hidden Flame'],
  cave: ['the Crooked Salt', 'the Singing Bones', 'the Wet Stair', 'the Black Light', 'the Loud Dark', 'the Blind Wyrm', 'the Glowing Crystal', 'the Deep Echo', 'the Endless Drop', 'the Slime Pools'],
  sewer: ['the Ribbon Lock', 'the Tenfold Gate', 'the Old Sluice', 'the Drowned Bell', 'the Bone-Run', 'the Plague Rats', 'the Blind Beggar', 'the Filthy Tide', 'the Poisoned Water', 'the Hidden Smugglers'],
  manor: ['the Long-Buried', 'the Vanished Heir', 'the Eight Brides', 'Lord Ashe', 'the Locked Wing', 'the Mended Pane', 'the Mad Count', 'the Weeping Widow', 'the Cursed Bloodline', 'the Ghostly Servants'],
  mine: ['the Black Vein', 'the Lost Crew', 'the Iron Heart', 'the Cracked Anvil', 'the Old Forewoman', 'the Deepest Shaft', 'the Golden Seam', 'the Blind Miners', 'the Collapsed Tunnel', 'the Echoing Pick'],
  ship: ['the Drowned Captain', 'Lady Halse', 'the Iron Whale', 'the Three Storms', 'the Bone Mast', 'the Cursed Voyage', 'the Bloody Mutiny', 'the Silent Crew', 'the Torn Sails', 'the Barnacled Hull'],
  woods: ['the Hanged Witches', 'the Sleeping Lord', 'the Antlered King', 'the Long Bough', 'the Iron Gallows', 'the Whispering Trees', 'the Blood-Stained Leaves', 'the Lost Children', 'the Faerie Queen', 'the Dark Druid'],
  swamp: ['the Sunken Crown', 'Twelve Lost Saints', 'the Witch-Mother', 'the Croaking King', 'the Gilded Hand', 'the Will-o-Wisp', 'the Drowned Village', 'the Rotting Logs', 'the Poisoned Mist', 'the Mud-Men'],
  mountain: ['the Iron Tooth', "Storm-King's Folly", 'the Last Pilgrim', 'the Hanging Lanterns', 'the Frozen Saints', 'the Howling Wind', 'the Broken Bridge', 'the Eagle\'s Nest', 'the Cloud-Veiled Peak', 'the Stone Giants'],
  frozen: ['the Lost Pilgrim', 'the Pale Sister', 'the Mended Hammer', 'the Sleeping Wolves', 'the Long Night', 'the Ice Queen', 'the Shattered Glacier', 'the Frozen Tears', 'the Blizzard\'s Heart', 'the White Dragon'],
  city: ['the Cross-Quarter', 'the Iron Door', 'Lampblack Lane', 'the Salt Market', 'the Hanged Tax-Man', 'the Thieves\' Guild', 'the Beggar\'s Court', 'the Silent Assassins', 'the Rat Catcher\'s Alley', 'the Red Lanterns'],
};

// Room content table. Weights:
//   empty: 30, monster: 25, trap: 10, hazard: 10, treasure: 8, feature: 12, puzzle: 5
export const ROOM_CONTENT_KINDS = [
  { value: 'empty' as const, weight: 30 },
  { value: 'monster' as const, weight: 25 },
  { value: 'trap' as const, weight: 10 },
  { value: 'hazard' as const, weight: 10 },
  { value: 'treasure' as const, weight: 8 },
  { value: 'feature' as const, weight: 12 },
  { value: 'puzzle' as const, weight: 5 },
];

export type RoomKind = 'empty' | 'monster' | 'trap' | 'hazard' | 'treasure' | 'feature' | 'puzzle';

const ROOM_DESCRIPTIONS_INDOOR: Record<RoomKind, readonly string[]> = {
  empty: [
    'an unremarkable room, recently disturbed',
    'an unremarkable room, undisturbed for years',
    'a room that someone has been sleeping in',
    'a room that has been hastily searched and abandoned',
    'a quiet room with nothing of obvious interest',
    'a barren room stripped of all its furnishings',
    'an empty chamber covered in a thick layer of undisturbed dust',
    'a small, bare room that echoes slightly',
    'an unremarkable corridor ending in this empty space',
    'a quiet room smelling faintly of ozone and old paper',
  ],
  monster: [
    "the room's inhabitants are mid-meal and unhappy to be interrupted",
    'a creature is asleep here; the floor is strewn with the leavings of its last meal',
    'two creatures are arguing here; their voices carry into the corridor',
    'the room is a den; the inhabitants will fight to defend it',
    'a sentry stands here; raising the alarm will summon more',
    'the creature here is wounded; it may be willing to bargain',
    'a group of creatures are playing a crude game with knucklebones',
    'an ambush is set here, waiting for the first person to enter',
    'the inhabitants are busy repairing their weapons and armor',
    'a single powerful creature claims this space as its personal domain',
  ],
  trap: [
    'a pressure plate triggers a hidden mechanism when stepped on',
    'a tripwire across the doorway releases something into the room',
    'the ceiling is unstable; a single loud noise will bring it down',
    'an old ward inscribed on the lintel triggers when crossed',
    'a swinging blade waits behind the door for the second person through',
    'a false floor covers a deep pit filled with rusted spikes',
    'poison gas vents from small holes in the walls when a lever is pulled',
    'a hidden crossbow fires from the darkness when the chest is opened',
    'the door locks shut automatically, and water begins filling the room',
    'a magical glyph of warding detonates with elemental force',
  ],
  hazard: [
    'the floor is half-flooded with cold black water',
    'mould grows thickly on every surface; touching it stains the skin',
    'the air is thin here; breathing for long is exhausting',
    'something in the walls is whispering; the longer you listen the harder it is to leave',
    'the floor is slick with old grease; running is dangerous',
    'thick, choking smoke from an unknown source fills the upper half of the room',
    'the walls are lined with razor-sharp crystals that snag on clothing and flesh',
    'a localized area of intense magical heat makes metal unbearable to touch',
    'the floor is littered with unstable rubble that shifts underfoot',
    'patches of invisible, sticky webbing hang from the ceiling',
  ],
  treasure: [
    'a small unlocked chest holds modest coin and an unidentified pouch',
    'an iron lockbox is bolted to the floor; the key is not here',
    'a treasure offering on a small altar; taking it has consequences',
    'a stash hidden behind a loose stone in the wall',
    'a body in old armour, still wearing rings',
    'a beautifully carved wooden box containing delicate jewelry',
    'a velvet sack filled with assorted uncut gemstones',
    'a collection of rare, ancient coins scattered across a table',
    'a magical weapon resting on a velvet cushion',
    'a sealed scroll tube containing forgotten spells or maps',
  ],
  feature: [
    'a stone altar carved with crude symbols; offerings are arranged on top',
    "a deep pit at the room's centre; the bottom cannot be seen from the rim",
    'an old well; the water is fresh',
    'a great chain in the floor, padlocked, leading down into darkness',
    'a circle of stones; the air inside the circle is markedly colder',
    'a mural so faded it is barely legible; what remains is unsettling',
    'a single tall mirror in a gilt frame; it does not reflect the room',
    'a massive, intricate clockwork mechanism that ticks loudly',
    'a glowing crystal embedded in the ceiling, illuminating the room',
    'a large, detailed map of the surrounding area carved into the floor',
  ],
  puzzle: [
    'three doors stand at the far wall, each with a different rune; only one is the way forward',
    'a chessboard inlaid in the floor, with two pieces overturned; what they signify is unclear',
    'a riddle in old script is carved over an iron door, in a language one of the party knows',
    'a column with rotating bands marked with sigils; the bands click when turned',
    'a series of unlit braziers that must be ignited in a specific color sequence',
    'a heavy stone door with multiple keyholes, but no keys in sight',
    'a sequence of floor tiles that must be stepped on in the correct musical order',
    'a statue missing its weapon, which is hidden elsewhere in the room',
  ],
};

const ROOM_DESCRIPTIONS_OUTDOOR: Record<RoomKind, readonly string[]> = {
  empty: [
    'an unremarkable spot, recently passed through',
    'an unremarkable place, undisturbed for years',
    'a sheltered patch where someone has been sleeping',
    'a place hastily searched and abandoned',
    'a quiet stretch with nothing of obvious interest',
    'a desolate area devoid of any plant or animal life',
    'a small clearing surrounded by dense, impassable thicket',
    'an empty expanse of rocky terrain with no hiding places',
    'a quiet grove where the wind doesn\'t seem to reach',
    'a flat, open space that looks artificially cleared',
  ],
  monster: [
    "the place's inhabitants are mid-meal and unhappy to be interrupted",
    'a creature dozes here; the ground is strewn with the leavings of its last meal',
    'two creatures are arguing here; their voices carry in the open air',
    'this is a hunting ground; the inhabitants will fight to defend it',
    'a sentry watches here; raising the alarm will summon more',
    'the creature here is wounded; it may be willing to bargain',
    'a pack of creatures are tracking prey and have just picked up a scent',
    'a large beast is marking its territory on the surrounding trees',
    'a group of humanoids are setting up a temporary camp',
    'a territorial creature fiercely defends a specific natural feature',
  ],
  trap: [
    'a snare hidden under leaves and dirt triggers when stepped on',
    'a tripwire across the path releases something into the open',
    'an old ward inscribed on a stone marker triggers when crossed',
    'a deadfall propped over the path, set to drop on a passing back',
    'an apparently safe footing is a thin crust over a deeper pit',
    'a concealed pit trap filled with sharpened stakes',
    'a cleverly hidden net trap designed to hoist victims into the trees',
    'a rockslide rigged to trigger when a specific boulder is moved',
    'poisonous darts fire from hidden tubes in the surrounding foliage',
    'a magical glyph hidden under a layer of moss',
  ],
  hazard: [
    'standing water hides cold, fouled depths',
    'mould or pollen here stains the skin on contact',
    'the air is heavy and hard to breathe for long',
    'something out of sight is whispering; the longer you listen the harder it is to leave',
    'the ground is slick with mud or melt; running here is dangerous',
    'a patch of quicksand disguised as solid ground',
    'toxic fumes rising from natural vents in the earth',
    'a field of thorny plants that tear at flesh and clothing',
    'an area prone to sudden, violent magical storms',
    'swarms of biting insects that carry debilitating diseases',
  ],
  treasure: [
    'a small unlocked chest is tucked into the brush, holding modest coin',
    'an iron lockbox is pinned to a stake; the key is not here',
    'a treasure offering left at a small shrine; taking it has consequences',
    'a stash hidden behind a loose stone in a wall or marker',
    'a body in old armour, still wearing rings',
    'a cache of supplies buried shallowly under a distinctive tree',
    'a hollow log containing a wrapped bundle of valuable furs',
    'a skeleton clutching a surprisingly pristine, jeweled dagger',
    'a scattering of coins leading into a dark, narrow crevice',
    'a rare, valuable herb growing in an isolated patch',
  ],
  feature: [
    'a weathered stone marker carved with crude symbols; offerings are arranged at its base',
    "a deep pit at the place's centre; the bottom cannot be seen from the rim",
    'an old well or spring; the water is fresh',
    'a great chain set into stone, padlocked, leading down into darkness',
    'a ring of stones; the air inside the ring is markedly colder',
    'a faded mural carved into a cliff or wall; what remains is unsettling',
    'a single tall mirror in a gilt frame, propped where it should not be; it does not reflect what stands before it',
    'a massive, ancient tree with a hollow large enough to shelter several people',
    'a natural bridge of stone spanning a deep chasm',
    'a cluster of giant, glowing mushrooms illuminating the area',
  ],
  puzzle: [
    'three paths fork ahead, each marked with a different rune; only one is the way forward',
    'a chequered pattern set into the ground, with two pieces overturned; what they signify is unclear',
    'a riddle in old script is carved over a gate, in a language one of the party knows',
    'a stone post with rotating bands marked with sigils; the bands click when turned',
    'a series of standing stones that must be touched in a specific order based on the stars',
    'a natural maze of dense hedges with shifting paths',
    'a sundial that casts a shadow pointing towards a hidden entrance only at a specific time',
    'a stone face carved into a cliff that requires a specific offering to open its mouth',
  ],
};

export const ROOM_DESCRIPTIONS_BY_CATEGORY: Record<DungeonSiteCategory, Record<RoomKind, readonly string[]>> = {
  indoor: ROOM_DESCRIPTIONS_INDOOR,
  outdoor: ROOM_DESCRIPTIONS_OUTDOOR,
};

// Kept for backward compatibility / direct table access.
export const ROOM_DESCRIPTIONS_BY_KIND = ROOM_DESCRIPTIONS_INDOOR;

const ROOM_DRESSING_INDOOR: readonly string[] = [
  'broken crockery underfoot; an old candle stub on a shelf',
  "a child's drawing in chalk on the far wall; it has been here a long time",
  'a single boot, dry and cracked, in the corner',
  'the bones of small animals piled into a strange shape by the door',
  'a stack of dust-thick books no one will ever read again',
  'a torn banner draped from a beam, its sigil long faded',
  'three iron hooks in the wall, one of which has been wrenched out of true',
  'old rope coiled neatly in the corner, oiled, as if waiting',
  'a broken stair rising into the ceiling and stopping mid-step',
  'a single eye painted on each wall, watching the centre of the room',
  'an old fire in the centre of the room, banked, embers cooling',
  'a small tin cup half full of dark, foul water',
  "a child's wooden toy left at the foot of an altar",
  'a cracked stone basin with brown stains around the rim',
  'an axe buried in a wooden post, the handle long since rotted',
  'a length of clean silk thread snagged on a nail',
  'a row of small boots arranged neatly against one wall',
  'a low whistling sound that has no obvious source',
  'an upturned chair; the rest of the furniture is missing',
  'a calendar carved into the wall ending three months ago',
  'a shattered mirror, its silver backing flaking away',
  'a pile of rusted iron nails scattered across the floor',
  'a faded tapestry depicting a forgotten battle',
  'a solitary chair facing the corner of the room',
  'a collection of empty glass vials covered in dust',
  'a small, meticulously carved wooden figurine of a wolf',
  'a patch of scorch marks on the ceiling',
  'a single, pristine white feather resting on a dirty table',
  'a broken lute with its strings snapped',
  'a detailed map of a place that does not exist',
  'a bowl of dried, unrecognizable fruit',
  'a heavy iron key with no obvious lock nearby',
  'a pair of discarded, mismatched gloves',
  'a faint smell of lavender and decay',
  'a small pile of ashes in the shape of a perfect circle',
  'a set of dice carved from bone',
  'a tarnished silver locket with a faded portrait inside',
  'a collection of smooth river stones stacked in a cairn',
  'a single, deeply gouged scratch across a wooden door',
  'a dried bouquet of black roses',
];

const ROOM_DRESSING_OUTDOOR: readonly string[] = [
  'broken pottery underfoot; a wax candle stub among the leaves',
  "a child's drawing chalked on a tree-trunk or post; it has been here a long time",
  'a single boot, dry and cracked, left in the brush',
  'the bones of small animals piled into a strange shape at a crossing',
  'a torn banner hung from a low branch, its sigil long faded',
  'three iron hooks driven into a tree or post, one wrenched out of true',
  'old rope coiled neatly in a hollow, oiled, as if waiting',
  'a broken stair carved into a slope, rising and stopping mid-step',
  'a single eye painted onto each of four trees or posts, watching the centre',
  'a banked fire among loose stones, embers cooling, no one in sight',
  'a small tin cup half full of dark, foul water',
  "a child's wooden toy left at the foot of a stone marker",
  'a cracked stone basin with brown stains around the rim',
  'an axe buried in a wooden post, the handle long since rotted',
  'a length of clean silk thread snagged on a thorn',
  'a row of small boots arranged neatly along the path',
  'a low whistling sound that has no obvious source',
  'an upturned chair, alone in the open, with no other furniture in sight',
  'a calendar carved into the bark of a great tree, ending three months ago',
  'fresh boot prints leading off in one direction, and back again, three times',
  'a rusted hunting trap abandoned in the tall grass',
  'a circle of salt poured carefully around a small stump',
  'a collection of bird skulls tied to a branch with twine',
  'a piece of torn, bloody fabric snagged on a briar',
  'a solitary grave marked with an unmarked river stone',
  'a small, smoldering campfire that smells of sweet pine',
  'a makeshift shelter built from woven branches, recently used',
  'a pile of cracked acorns and discarded nut shells',
  'a single, pristine arrow stuck deep into a tree trunk',
  'a faded ribbon tied in a complex knot around a sapling',
  'a puddle of water that reflects the sky, even at night',
  'a scattering of colorful, unnatural-looking feathers',
  'a heavy iron chain leading into a dark, muddy hole',
  'a pair of discarded, mud-caked boots',
  'a faint smell of brimstone and wet earth',
  'a small pile of stones arranged to form an arrow pointing north',
  'a set of massive, unidentifiable animal tracks',
  'a tarnished silver coin partially buried in the dirt',
  'a collection of empty snail shells arranged in a spiral',
  'a deeply scratched message on a stone, mostly illegible',
];

export const ROOM_DRESSING_BY_CATEGORY: Record<DungeonSiteCategory, readonly string[]> = {
  indoor: ROOM_DRESSING_INDOOR,
  outdoor: ROOM_DRESSING_OUTDOOR,
};

// Kept for backward compatibility / direct table access.
export const ROOM_DRESSING = ROOM_DRESSING_INDOOR;

const HAZARD_TABLE_INDOOR: readonly string[] = [
  'standing water hides a deep pit at the centre of the chamber',
  'a fungus growth spreads damaging spores when disturbed',
  'air pockets of stale gas pool near the floor',
  'thin floors over older drainage pits',
  'the dungeon settles audibly; loud noises bring stones down from the ceiling',
  'cursed runes carved into the door frames; crossing them costs the will to keep going',
  'pools of strong acid disguised as still water',
  'a structural weakness — half the corridor collapses if more than one person treads on the wrong stone',
  'a faint magical chill that slows movement and clouds the mind',
  'an infestation of small biting things in the walls',
  'a rusted portcullis held up by a single rotting rope',
  'a patch of black slime on the ceiling that drops on heat sources',
  'a tripwire that releases a rolling boulder from an alcove',
  'a swarm of carnivorous beetles disturbed by loud noise',
  'a magically silenced area that also prevents verbal spellcasting',
  'a seemingly solid stone floor that turns to quicksand when stepped upon',
  'a room filled with hallucinogenic smoke from braziers',
  'a series of pressure plates that shoot poisoned darts from the walls',
  'a patch of brown mold that rapidly absorbs heat, freezing the surrounding area',
  'a localized gravity inversion trap that drops victims onto a spiked ceiling',
];

const HAZARD_TABLE_OUTDOOR: readonly string[] = [
  'a sucking pool of bog water lies under a thin lid of leaves and scum',
  'a fungus growth spreads damaging spores when disturbed',
  'pockets of stale gas pool in low ground and old hollows',
  'thin soil over older sinkholes; the wrong step opens it',
  'the slope settles audibly; loud noises bring stones down from above',
  'cursed markers staked into the path; crossing them costs the will to keep going',
  'pools of strong acid disguised as still water',
  'a structural weakness in the way — half the trail collapses if more than one person treads on the wrong stone',
  'a faint magical chill that slows movement and clouds the mind',
  'an infestation of small biting things in the undergrowth',
  'a concealed snare meant for large game, strong enough to snap a leg',
  'a patch of ground covered in razor-sharp obsidian shards hidden by tall grass',
  'a nest of aggressive ground-wasps disturbed by heavy footfalls',
  'a sudden, unnatural localized blizzard that rapidly drops body temperature',
  'a patch of quicksand cleverly disguised as solid, dry earth',
  'a thick, thorny vine that reacts to movement by constricting',
  'a geyser field that intermittently blasts scalding water and steam',
  'a patch of violet fungus that attacks anything that comes near',
  'a localized area of dead magic where spells simply fizzle out',
  'a hidden pit filled with sharpened wooden stakes covered by loose branches',
];

export const HAZARD_TABLE_BY_CATEGORY: Record<DungeonSiteCategory, readonly string[]> = {
  indoor: HAZARD_TABLE_INDOOR,
  outdoor: HAZARD_TABLE_OUTDOOR,
};

// Kept for backward compatibility / direct table access.
export const HAZARD_TABLE = HAZARD_TABLE_INDOOR;

// Inhabitant pools by theme + tier. Names are generic creature archetypes —
// no SRD descriptions or stat lines copied.
export const INHABITANTS_BY_THEME_TIER: Record<DungeonTheme, Record<DungeonChallengeTier, readonly string[]>> = {
  ruin: {
    '0-4':   ['kobold scavengers', 'giant rats', 'goblin claim-jumpers', 'stirges', 'a single ghoul'],
    '5-10':  ['gnoll war band', 'wererat squatters', 'shadow drake roosting here', 'a mind-broken wizard and their familiar'],
    '11-16': ['black guard cultists', 'a marshalled wight and their captains', 'a roost of perytons'],
    '17+':   ['a slumbering ancient nightmare', 'a bound storm giant', "a forgotten god's herald"],
  },
  lair: {
    '0-4':   ['wolves', 'giant centipedes', 'a single ogre', 'awakened wolves'],
    '5-10':  ['owlbear pair', 'griffon parent and brood', 'manticore', 'troll and its young'],
    '11-16': ['young dragon and its hoard-watcher', 'chimera mated pair', 'a pack of hellhounds and their handler'],
    '17+':   ['adult dragon and its mate', 'a behir', 'a roc and its rider'],
  },
  tomb: {
    '0-4':   ['skeletons', 'crawling claws', 'an animated armoury', 'a swarm of beetles'],
    '5-10':  ["wight king's retinue", 'a small unit of wraiths', 'an animated guardian and its hounds'],
    '11-16': ['mummies of the funerary court', 'a deathlock', "a lich's apprentice"],
    '17+':   ['a lich and their inner court', 'an ancient mummy lord', 'a deathknight and his cursed retinue'],
  },
  stronghold: {
    '0-4':   ['bandit company', 'hobgoblin watch', 'a small unit of orcs'],
    '5-10':  ['veteran mercenary garrison', 'hobgoblin warband with shamans', 'an oni in disguise'],
    '11-16': ['a fallen knight-captain and his elite', 'a war-priest of a forbidden god', 'a stone giant retinue'],
    '17+':   ['a marshal of the dead and their banner-host', 'an archfey general and their court'],
  },
  temple: {
    '0-4':   ['acolyte cultists', 'a single doppelganger pretending to be the priest', 'small swarms of bats'],
    '5-10':  ['a senior cult priest and their inner circle', 'a vrock or other demonic visitor', 'a fanatical knight-templar'],
    '11-16': ['a high priest with several lieutenants', 'an outsider bound to the altar', 'a corrupted celestial'],
    '17+':   ["a god's herald (corrupted)", 'a pit fiend ambassador', 'a planar court visiting in secret'],
  },
  cave: {
    '0-4':   ['cave goblins', 'giant spiders', 'troglodytes', 'a single ettin'],
    '5-10':  ['drow scouts', 'umber hulk', 'kuo-toa raiders', 'a hill giant and their bull'],
    '11-16': ['drow noble scouting party', "a beholder's lesser kin", 'a stone giant matriarch and clan'],
    '17+':   ['an aboleth and its court', 'a beholder', 'a balor visiting the deep dark'],
  },
  sewer: {
    '0-4':   ['wererat squatters', 'rust monsters', 'otyugh', 'a small gang of gricks'],
    '5-10':  ['wererat clan elders', 'a young black dragon making a home here', 'gricks of an unusual size'],
    '11-16': ['wererat clan war-band', "a sleeping aboleth's thralls", 'a deathlock', 'a roper at the central chamber'],
    '17+':   ["an aboleth's outlying thrall-host", 'a roper-thrall network with overseers', 'an ancient sewer-wyrm'],
  },
  manor: {
    '0-4':   ['armed squatters', 'ghouls in the cellars', 'a poltergeist tearing through the upper rooms', 'a kenku grifter pretending at heir', 'rats and their wererat servant'],
    '5-10':  ['banshee in the music room', 'wraith of the last lord', 'a doppelganger pretending to be the steward', 'a small unit of ghosts haunting the lower floor'],
    '11-16': ['ghost-lord and her bound retainers', 'a death tyrant claiming the library', 'a coven of vampires nesting in the upper wing'],
    '17+':   ['a lich masquerading as the master of the house', 'an aboleth in the cellar pool, served by charmed staff', 'an ancient ghost-king and his bound court'],
  },
  mine: {
    '0-4':   ['kobold miners with their wyrm-priest', 'rust monsters in the deeper drifts', 'a small infestation of stirges', 'duergar scouts', 'a single ettin found below'],
    '5-10':  ['duergar mining-clan and overseer', 'umber hulk in the deep stope', 'a small drow scouting party', 'a deep crow with rust-feathered chicks'],
    '11-16': ['drow noble mining-overseer and her elite', 'a mind flayer surveying the lower galleries', 'a stone giant matriarch claim-jumper'],
    '17+':   ['an aboleth and its drow thralls in the flooded sump', 'an elder brain attended by an entire thrall-court', 'a dragon making its hoard in the lowest gallery'],
  },
  ship: {
    '0-4':   ['pirate boarding crew', 'merrow scouts', 'sahuagin raiders', 'sea-rats and their wererat captain', 'ghouls of the drowned'],
    '5-10':  ['sahuagin warband with priestess', 'a sea hag captaining the wreck', 'a small unit of ghasts and their officer', 'a coven of merrow holding the lower decks'],
    '11-16': ['a marid bound to the figurehead', 'a kraken-priest cult crewing the vessel', 'a death-captain and her drowned officers'],
    '17+':   ['a kraken consort and her thrall-host', 'a marid sovereign in disguise', 'an aboleth captaining a vessel of thralls'],
  },
  woods: {
    '0-4':   ['bandit highwaymen', 'awakened wolves', 'goblin tribe', 'pixies and a hostile satyr', 'a desperate hag in her cottage'],
    '5-10':  ['werewolf hunting pack', 'displacer beast', 'centaur war-band', 'an awakened tree and its grove of thralls'],
    '11-16': ['green hag coven', 'treants and their woodland host', 'a young green dragon and its kobold cult'],
    '17+':   ['an archdruid corrupted into a fey lord', 'an ancient green dragon and its grove', 'an awakened ancient forest itself, angry'],
  },
  swamp: {
    '0-4':   ['lizardfolk scouts', 'bullywugs', 'giant frogs and their tadpole brood', "a will-o'-wisp and its bait"],
    '5-10':  ['lizardfolk shaman and her warband', 'a black dragon wyrmling and its kobold court', 'a hag and her doll-children', 'a hydra of moderate size'],
    '11-16': ['adult black dragon and bog-cult', 'night hag and her dreamcrop', 'a mire-hydra of unusual size'],
    '17+':   ['ancient black dragon and her drowned court', 'a coven of three hags atop a bone throne', 'a marsh-walker — an aboleth abroad on the surface'],
  },
  mountain: {
    '0-4':   ['goat-rider goblins', 'a single ogre and his cairn', 'orcish scouts', 'a roost of harpies'],
    '5-10':  ['mountain dwarf bandit-clan', 'griffon nesting pair', 'a chimera at the high pass', 'manticore and its young'],
    '11-16': ['stone giant and his thanes', 'a frost giant scout-party', 'a roc claimant of the upper crags'],
    '17+':   ['storm giant matriarch and her court', 'an ancient roc and its dwarf-riders', 'a dragon of the high cold and her aerie'],
  },
  frozen: {
    '0-4':   ['ice-toad pack', 'wolves and their winter alphas', 'frost-touched gnolls', 'a young winter wolf'],
    '5-10':  ['winter wolf pack with a giant rider', "frost giants' scout-camp", 'a yeti and its mate', 'remorhaz hatchlings'],
    '11-16': ['frost giant raiding-party with their dread mage', 'a remorhaz and its mate', 'an ice devil scouting the high north'],
    '17+':   ['white dragon ancient and her court of yeti', 'a frost giant jarl and her thanes', 'an ice devil legate and her bound retinue'],
  },
  city: {
    '0-4':   ['street toughs', "a thieves' guild apprentice cell", 'cutpurses and their fence', 'rats and a wererat informer', 'corrupt city watch on the take'],
    '5-10':  ["thieves' guild ward-captain and her enforcers", "an assassin's circle", 'a doppelganger working as a fence', 'a vampire-spawn brood in the cellars'],
    '11-16': ['a master assassin and her trained killers', 'an oni working as a crime boss', 'a vampire and her thrall-network'],
    '17+':   ["an archdevil's mortal ambassador", 'a vampire lord and her noble brood', 'a rakshasa crime-lord and her court'],
  },
};

// Theme-specific area names. Each theme uses labels that fit its kind of
// place — corridors and chapels for indoor sites, clearings and alleys for
// outdoor ones.
export const ROOM_NAME_NOUNS_BY_THEME: Record<DungeonTheme, readonly string[]> = {
  ruin: ['Antechamber', 'Hall', 'Foyer', 'Gallery', 'Corridor', 'Stair', 'Workshop', 'Cloister', 'Cell', 'Vault'],
  lair: ['Den', 'Hollow', 'Pit', 'Burrow', 'Nest', 'Run', 'Sump', 'Larder', 'Chamber', 'Lair'],
  tomb: ['Antechamber', 'Crypt', 'Ossuary', 'Cell', 'Sanctum', 'Vault', 'Stair', 'Chapel', 'Reliquary', 'Mausoleum'],
  stronghold: ['Barracks', 'Guardroom', 'Hall', 'Watchpost', 'Armoury', 'Mess', 'Workshop', 'Cell', 'Corridor', 'Tower-Stair'],
  temple: ['Chapel', 'Sanctum', 'Vestry', 'Cloister', 'Reliquary', 'Bell-Loft', 'Crypt', 'Antechamber', 'Hall', 'Refectory'],
  cave: ['Hollow', 'Gallery', 'Sump', 'Pit', 'Squeeze', 'Cavern', 'Stair', 'Throat', 'Ledge', 'Crack'],
  sewer: ['Tunnel', 'Junction', 'Cistern', 'Sluice', 'Sump', 'Drain', 'Pipe', 'Chamber', 'Outfall', 'Ledge'],
  manor: ['Foyer', 'Library', 'Parlour', 'Dining Room', 'Bedroom', "Servants' Stair", 'Study', 'Conservatory', 'Cellar', 'Wing'],
  mine: ['Shaft', 'Gallery', 'Drift', 'Adit', 'Stope', 'Winze', 'Lode', 'Sump', 'Junction', 'Cage Landing'],
  ship: ['Forecastle', 'Hold', 'Galley', 'Quarterdeck', 'Cabin', 'Bilge', 'Brig', 'Foredeck', 'Crew Berth', 'Magazine'],
  woods: ['Clearing', 'Glade', 'Thicket', 'Hollow', 'Grove', 'Fork', 'Bridge', 'Ridge', 'Stream-Crossing', 'Ring'],
  swamp: ['Hummock', 'Causeway', 'Wallow', 'Pool', 'Boardwalk', 'Stilt-Hut', 'Ford', 'Sinkhole', 'Reed-Bed', 'Bend'],
  mountain: ['Pass', 'Saddle', 'Switchback', 'Cliff-Ledge', 'Cairn', 'Watch-Stone', 'Cleft', 'Ridge', 'Spur', 'Bridge'],
  frozen: ['Drift', 'Crevasse', 'Ice-Hall', 'Hoar-Field', 'Snow-Bridge', 'Wind-Cleft', 'Cairn', 'Tunnel', 'Hollow', 'Pillar'],
  city: ['Alley', 'Square', 'Tenement', 'Tavern Yard', 'Backstreet', 'Crossroads', 'Bridge', 'Cellar Door', 'Stable', 'Warehouse'],
};

// Kept for backward compatibility / fallback list.
export const ROOM_NAME_NOUNS: readonly string[] = [
  'Antechamber', 'Cell', 'Chapel', 'Cistern', 'Cloister', 'Corridor', 'Crypt', 'Den',
  'Foyer', 'Gallery', 'Guardroom', 'Hall', 'Hollow', 'Kitchen', 'Larder', 'Library',
  'Mess', 'Pit', 'Refectory', 'Stair', 'Storeroom', 'Sump', 'Vestry', 'Workshop',
];

export type DungeonRoomDraft = DungeonResult['details']['rooms'][number];

// Exit-type weights used by the map layout. `states` is the door-state table
// rolled when the exit is a door variant; non-door exits leave it undefined.
export const EXIT_TYPE_WEIGHTS: readonly {
  type: string;
  weight: number;
  states?: readonly string[];
}[] = [
  {
    type: 'door',
    weight: 32,
    states: [
      'closed, unlocked',
      'closed and locked from this side',
      'closed and locked from the other side',
      'stuck — forced open with effort',
      'ajar, swinging slightly',
      'lock recently pried open',
    ] as const,
  },
  { type: 'archway', weight: 22 },
  { type: 'corridor', weight: 22 },
  {
    type: 'secret door',
    weight: 8,
    states: [
      'concealed behind a tapestry',
      'flush with the masonry, no seam visible',
      'opens to the right pressure on a flagstone',
      'triggered by a counterweight elsewhere',
    ] as const,
  },
  { type: 'stairs up', weight: 6 },
  { type: 'stairs down', weight: 6 },
  { type: 'ladder', weight: 2 },
  { type: 'shaft', weight: 1 },
  { type: 'portal', weight: 1 },
];
