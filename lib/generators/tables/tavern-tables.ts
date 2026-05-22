// Tavern tables — ORIGINAL CONTENT.
//
// Source / licensing: no DMG / PHB content. Two-part name tables, atmosphere
// descriptors, menu items, patron stubs, and rumour templates are all
// original prose authored for this project.

import type { SettlementSizeClass } from '../types';

export type TavernVibe = 'rough' | 'cozy' | 'upscale' | 'seedy' | 'themed';

export const TAVERN_NAME_PREFIXES: readonly string[] = [
  'The Brass', 'The Bent', 'The Bell', 'The Broken', 'The Crooked', 'The Crimson',
  'The Drowned', 'The Empty', 'The Forgotten', 'The Gilded', 'The Green', 'The Half-Penny',
  'The Hollow', 'The Iron', 'The Last', 'The Lonesome', 'The Long', 'The Mended',
  'The Quiet', 'The Salt', 'The Six-Fingered', 'The Sleeping', 'The Slow', 'The Sober',
  'The Stitched', 'The Twice-Lost', 'The Unmarked', 'The Wandering', 'The White',
  'The Wild', 'The Yawning',
  'The Ancient', 'The Bitter', 'The Blazing', 'The Blind', 'The Brazen', 'The Chipped',
  'The Clockwork', 'The Dancing', 'The Dark', 'The Drunken', 'The Dusty', 'The Faded',
  'The Fallen', 'The Fat', 'The Fiery', 'The Flying', 'The Foggy', 'The Foolish',
  'The Frosty', 'The Golden', 'The Grinning', 'The Hidden', 'The Hungry', 'The Laughing',
  'The Leaky', 'The Lucky', 'The Mad', 'The Merry', 'The Misty', 'The Muddy', 'The Rusty',
];

export const TAVERN_NAME_SUFFIXES: readonly string[] = [
  'Anchor', 'Bell', 'Boar', 'Candle', 'Cloak', 'Compass', 'Crow', 'Crown', 'Cup',
  'Dog', 'Drake', 'Eel', 'Eye', 'Fish', 'Flagon', 'Fox', 'Goose', 'Halfpenny',
  'Hare', 'Hart', 'Hearth', 'Horn', 'Hound', 'Inn', 'Lantern', 'Lark', 'Mare',
  'Moon', 'Mug', 'Otter', 'Owl', 'Pillow', 'Quill', 'Ram', 'Raven', 'Rest',
  'Riddle', 'Sailor', 'Scribe', 'Sheaf', 'Shilling', 'Sigil', 'Sparrow', 'Spear',
  'Stag', 'Star', 'Stone', 'Stork', 'Sun', 'Sword', 'Tankard', 'Thistle', 'Thorn',
  'Toad', 'Wagon', 'Wheel', 'Whistle',
  'Apple', 'Axe', 'Barrel', 'Bear', 'Blade', 'Bone', 'Boot', 'Bow', 'Cat', 'Cauldron',
  'Chalice', 'Cheese', 'Clove', 'Coin', 'Crab', 'Cross', 'Dagger', 'Door', 'Dragon',
  'Drop', 'Drum', 'Eagle', 'Feather', 'Fiddle', 'Flame', 'Fleece', 'Gate', 'Ghost',
  'Giant', 'Goblet', 'Gull', 'Hammer', 'Hat', 'Hawk', 'Heart', 'Helm', 'Hog', 'Horse',
  'Key', 'Kite', 'Knight', 'Knot', 'Leaf', 'Lion', 'Lock', 'Lute', 'Mace', 'Maiden',
  'Mantle', 'Mirror', 'Mouse', 'Nail', 'Oak', 'Oar', 'Pig', 'Pike', 'Pint', 'Pipe',
];

export const ATMOSPHERE_BY_VIBE: Record<TavernVibe, readonly string[]> = {
  rough: [
    'a low, smoke-blackened common room thick with the smell of sweat and stale beer',
    'long benches scarred from a hundred fights, the floor sticky in places no one wants to think about',
    'two doors leading out at the back; the regulars know which one leads to the alley and which to the kitchen',
    'a hearth that never quite gets hot enough, and a serving woman with a cudgel under her counter',
    'a constant low roar of arguments and breaking glass that nobody seems to mind',
    'heavy iron bars on the small windows, and bloodstains on the sawdust floor',
    'the smell of cheap tobacco and wet dog hangs heavy in the air',
    'tables are bolted to the floor, and the barkeep has a loaded crossbow mounted on the wall',
  ],
  cozy: [
    'low ceiling beams hung with copper pots; one corner permanently smells of bread',
    'warm yellow lamplight, scrubbed tables, and a black-and-white cat asleep by the hearth',
    'a single round window above the door letting in afternoon sun the colour of honey',
    'thick rugs on a flagstone floor and the constant low burr of friendly conversation',
    'a roaring fire with a kettle always on the boil, and a smell of roasting apples',
    'soft cushions on every bench, and a friendly hound that wanders between tables',
    'the gentle clinking of mugs and a bard softly strumming a lute in the corner',
    'a smell of beeswax and lavender, and a landlady who remembers everyone\'s name',
  ],
  upscale: [
    'tall windows leaded with green glass, white linen tables, and a discreet servant at each door',
    'a high-ceilinged dining room with a quartet at the far end playing something restrained',
    'crystal lamps with mirrored backs and the careful murmur of people pretending not to listen',
    'polished mahogany counters, brass fittings, and a smell of beeswax beneath the wine',
    'silver cutlery, delicate porcelain, and a sommelier with an intimidating gaze',
    'plush velvet booths with heavy curtains that can be drawn for privacy',
    'a faint scent of rare perfumes and expensive tobacco in the air',
    'intricate tapestries on the walls and a massive chandelier of cut glass',
  ],
  seedy: [
    'a low front room and three smaller booths in the back where deals are made and nothing is overheard',
    'flickering oil lamps, a curtain across the stairwell, and a watchman who never looks up',
    'a counter that is also a moneychanger\'s and a kitchen that closes earlier than advertised',
    'sawdust on the floor to absorb spilled drinks and anything else',
    'whispered conversations in dark corners, and a back door that sees more traffic than the front',
    'a smell of cheap perfume and stale ale, and eyes that track every new arrival',
    'a card game in the corner that looks rigged, and a barkeep who pretends not to notice',
    'a faint metallic tang in the air, and a noticeable lack of local watchmen',
  ],
  themed: [
    'every surface decorated to the theme, sometimes tipping into the absurd; the regulars do not seem to notice',
    'the kitchen serves only dishes that fit the conceit, with a hand-painted menu on the back wall',
    'a small stage where the staff perform a brief themed routine once an evening',
    'walls hung with relics of the theme, half of them obviously sourced from market stalls',
    'staff dressed in elaborate, uncomfortable-looking costumes that they take very seriously',
    'a signature drink served in a novelty vessel that costs extra to keep',
    'a constantly looping mechanical diorama that clatters noisily in the background',
    'a very specific scent pumped into the room that vaguely resembles the intended atmosphere',
  ],
};

export const VIBE_KEYWORDS: Record<TavernVibe, string[]> = {
  rough: ['dockhand', 'mercenary', 'caravan guard', 'pit-fighter', 'horse-breaker', 'brawler', 'smuggler', 'bounty hunter', 'thug', 'sailor'],
  cozy: ['weaver', 'baker', 'apprentice', 'pensioner', 'cooper', 'farmer', 'shepherd', 'tailor', 'blacksmith', 'midwife'],
  upscale: ['merchant', 'scholar', 'minor noble', 'diplomat', 'ambassador', 'jeweler', 'courtier', 'magistrate', 'banker', 'artisan'],
  seedy: ['smuggler', 'fence', 'informer', 'cutpurse', 'tax-shaver', 'assassin', 'spy', 'con artist', 'gambler', 'thief'],
  themed: ['cosplayer', 'enthusiast', 'fan', 'traveller', 'pilgrim', 'tourist', 'collector', 'historian', 'bard', 'eccentric'],
};

// Menu items keyed to settlement size: each entry includes a copper-piece
// price that scales with the size's price multiplier (reusing SIZE_PRICE_MARKUP
// from the shop tables).
export type MenuItemTable = { name: string; kind: 'food' | 'drink' | 'lodging'; basePriceCp: number };

export const TAVERN_MENU: readonly MenuItemTable[] = [
  // food
  { name: 'bread and dripping', kind: 'food', basePriceCp: 2 },
  { name: 'thick barley pottage', kind: 'food', basePriceCp: 3 },
  { name: 'cabbage and bacon stew', kind: 'food', basePriceCp: 4 },
  { name: 'fried fish and turnip', kind: 'food', basePriceCp: 5 },
  { name: 'mutton pie, sharp pepper crust', kind: 'food', basePriceCp: 7 },
  { name: 'roast chicken with brown gravy', kind: 'food', basePriceCp: 9 },
  { name: 'salt-cured pork hock', kind: 'food', basePriceCp: 8 },
  { name: 'rabbit, stewed with prunes', kind: 'food', basePriceCp: 10 },
  { name: 'venison cutlet, red wine reduction', kind: 'food', basePriceCp: 25 },
  { name: 'duck with crackling skin', kind: 'food', basePriceCp: 18 },
  { name: 'apple tart with cream', kind: 'food', basePriceCp: 6 },
  { name: 'plate of soft cheese, hard cheese, and oat biscuits', kind: 'food', basePriceCp: 8 },
  { name: 'bowl of salty broth with hardtack', kind: 'food', basePriceCp: 2 },
  { name: 'roasted root vegetables', kind: 'food', basePriceCp: 4 },
  { name: 'pork sausage with mustard seed', kind: 'food', basePriceCp: 6 },
  { name: 'spiced meat pastry', kind: 'food', basePriceCp: 5 },
  { name: 'whole roasted trout with herbs', kind: 'food', basePriceCp: 12 },
  { name: 'beef stew with heavy dumplings', kind: 'food', basePriceCp: 8 },
  { name: 'stuffed quail with wild rice', kind: 'food', basePriceCp: 20 },
  { name: 'honey-glazed ham slice', kind: 'food', basePriceCp: 15 },
  { name: 'sweet berry cobbler', kind: 'food', basePriceCp: 5 },
  { name: 'spiced pear roasted in wine', kind: 'food', basePriceCp: 7 },
  // drink
  { name: 'house ale', kind: 'drink', basePriceCp: 2 },
  { name: 'dark stout (pint)', kind: 'drink', basePriceCp: 3 },
  { name: 'cider, summer-pressed', kind: 'drink', basePriceCp: 3 },
  { name: 'mead, spiced', kind: 'drink', basePriceCp: 5 },
  { name: 'red wine, table-grade', kind: 'drink', basePriceCp: 6 },
  { name: 'white wine, dry', kind: 'drink', basePriceCp: 7 },
  { name: 'imported brandy', kind: 'drink', basePriceCp: 50 },
  { name: 'pot of tea, lemon-leaf', kind: 'drink', basePriceCp: 2 },
  { name: 'hot mulled wine (winter)', kind: 'drink', basePriceCp: 6 },
  { name: 'small beer (children\'s)', kind: 'drink', basePriceCp: 1 },
  { name: 'watered rum', kind: 'drink', basePriceCp: 2 },
  { name: 'bitter pale ale', kind: 'drink', basePriceCp: 4 },
  { name: 'sweet cherry wine', kind: 'drink', basePriceCp: 8 },
  { name: 'aged whiskey (shot)', kind: 'drink', basePriceCp: 15 },
  { name: 'strong dwarven spirits', kind: 'drink', basePriceCp: 20 },
  { name: 'hot spiced cider', kind: 'drink', basePriceCp: 4 },
  { name: 'mint tea', kind: 'drink', basePriceCp: 3 },
  { name: 'goat\'s milk', kind: 'drink', basePriceCp: 1 },
  // lodging
  { name: 'a place by the fire', kind: 'lodging', basePriceCp: 3 },
  { name: 'a bench in the common room', kind: 'lodging', basePriceCp: 5 },
  { name: 'shared room, four straw mattresses', kind: 'lodging', basePriceCp: 8 },
  { name: 'private room with a single bed', kind: 'lodging', basePriceCp: 25 },
  { name: 'private room with a desk and basin', kind: 'lodging', basePriceCp: 50 },
  { name: 'space in the stable loft', kind: 'lodging', basePriceCp: 2 },
  { name: 'shared room, two beds', kind: 'lodging', basePriceCp: 15 },
  { name: 'private suite with sitting room', kind: 'lodging', basePriceCp: 100 },
  { name: 'cot in the hallway', kind: 'lodging', basePriceCp: 4 },
];

// Patron stubs: a one-line "race/class hint, occupation, one-trait" template.
// These are skeletons the generator fills in (race, occupation, trait pools
// kept here).
export const PATRON_RACES: readonly string[] = [
  'human', 'half-elf', 'elf', 'dwarf', 'halfling', 'gnome', 'tiefling', 'half-orc', 'dragonborn',
];

export const PATRON_OCCUPATIONS: readonly string[] = [
  'caravan guard between jobs', 'travelling musician', 'farmhand on market day', 'pilgrim heading north',
  'off-duty militiaman', 'minor clerk in the local court', 'wandering scholar', 'apprentice smith',
  'down-on-luck mercenary', 'travelling priest', 'horse-trader', 'cooper\'s daughter',
  'travelling tinker', 'retired soldier', 'court bard between patrons', 'second mate on a river barge',
  'tin-cup beggar', 'travelling alchemist', 'jeweller passing through', 'sailor on land for a week',
  'bounty hunter tracking a mark', 'local magistrate having a quiet drink', 'guild artisan discussing trade',
  'fortune teller reading tea leaves', 'smuggler waiting for a contact', 'tax collector counting coin',
  'exhausted midwife', 'actor learning lines', 'grieving widow', 'celebrating father',
  'suspicious local watching strangers', 'drunk off-duty guard', 'pickpocket casing the room',
  'messenger changing horses', 'tired drover', 'apprentice wizard reading a primer',
  'ruined merchant drinking sorrows', 'successful prospector buying rounds', 'angry farmer complaining about weather',
  'bored noble seeking amusement',
];

export const PATRON_TRAITS: readonly string[] = [
  'always leaves a small coin on the table for the staff',
  'plays a stringed instrument badly but with feeling',
  'has a tattoo of a foreign letter on the inside of the wrist',
  'speaks too loudly when they have had a single drink',
  'wears a copper bracelet that they fidget with constantly',
  'limps slightly on the right foot, refuses to talk about it',
  'is missing the last joint of the smallest finger on the left hand',
  'whistles between sentences without realising',
  'always orders the same dish and never finishes it',
  'has a chipped clay pipe they fill from a leather pouch',
  'wears a green ribbon around the neck',
  'never sits with their back to the door',
  'speaks in a soft mainland accent that does not match the rest of their clothing',
  'has a single gold tooth and is proud of it',
  'always has a small dog with them, named for a saint',
  'never removes their gloves',
  'orders nothing but water and tips heavily',
  'has the rough manners of a soldier and the careful diction of a scholar',
  'carries a small leather notebook and writes a line whenever they think no one is looking',
  'always sits in the same corner; the regulars know not to take it',
  'has a nervous tic that makes them blink rapidly',
  'smells faintly of sulfur and ozone',
  'wears clothing that is ten years out of date',
  'has a laugh that sounds like breaking glass',
  'is completely bald and has a complex geometric tattoo on their scalp',
  'always carries a polished wooden cane but never leans on it',
  'speaks mostly in metaphors and riddles',
  'has hands covered in small, precise scars',
  'wears a heavy iron ring on their thumb',
  'constantly checks the time on a silver pocket watch',
  'has a very loud, booming voice but tries to whisper',
  'is accompanied by a large, silent bird on their shoulder',
  'refuses to eat anything they haven\'t prepared themselves',
  'has a silver streak in their hair and eyes that seem too old',
  'always has ink stains on their fingertips',
  'wears a pendant shaped like a half-moon',
  'has a habit of flipping a coin while listening to others',
  'seems to be carrying a large amount of hidden weaponry',
  'is excessively polite, almost to the point of mockery',
  'has a deep, hacking cough that they try to hide',
];

// Rumour templates. Each is a placeholder pattern with {VAR} slots that the
// generator fills with values from below.
export const RUMOR_TEMPLATES: readonly string[] = [
  'They say a {THING} was seen on the {PLACE} road last Tuesday — nobody who saw it has spoken since.',
  'The {NPC_TITLE} at {INSTITUTION} hasn\'t been seen in three days. Their door is locked from the outside.',
  'There\'s a {THING} in the {PLACE} that wasn\'t there a month ago. The {NPC_TITLE} says it shouldn\'t be touched.',
  'Last week a {NPC_TITLE} paid for a room in old coin — coin a century out of mint — and was gone before dawn.',
  'Two caravans have come through this month with the same story: {THING} in the woods past the {PLACE}.',
  '{INSTITUTION} is hiring people who don\'t mind night work and don\'t ask questions. The pay is too good.',
  'The {NPC_TITLE}\'s child has gone missing again. They came back the first two times. Nobody talks about how.',
  'A {THING} washed up on the {PLACE} at low tide. They\'ve buried it but the gulls won\'t go near.',
  'The bell at {INSTITUTION} rang three times after midnight and there\'s no one inside to ring it.',
  'A {NPC_TITLE} is offering coin for anyone willing to spend a single night in the {PLACE}.',
  'They say if you stand on the {PLACE} at sunset and call your own name, something else answers.',
  '{INSTITUTION} burned down twice this year and was rebuilt both times before anyone noticed who was doing the work.',
  'I heard the {NPC_TITLE} found a {THING} buried under the floorboards, and now they won\'t sleep in the house.',
  'Every night at dusk, a {THING} waits by the {PLACE}. It never approaches, just watches.',
  'The {NPC_TITLE} swears that the statues at {INSTITUTION} have moved a few inches since yesterday.',
  'Someone left a {THING} on the steps of {INSTITUTION}. The {NPC_TITLE} burned it, but the ashes wouldn\'t blow away.',
  'If you walk past the {PLACE} backwards, they say you\'ll hear a {THING} whispering your secrets.',
  'The {NPC_TITLE} has been buying up all the salt in town. Says it\'s for a {THING} they trapped in the cellar.',
  'A {THING} fell from the sky near the {PLACE}. It\'s still glowing, and the grass around it is dead.',
  'The water in the {PLACE} turned black for an hour yesterday. The {NPC_TITLE} says it\'s a warning.',
  'I saw a {THING} entering {INSTITUTION} through a wall. The {NPC_TITLE} just smiled and poured another drink.',
  'The old clock at {INSTITUTION} chimed thirteen times, and then a {THING} walked out of the shadows.',
  'A {NPC_TITLE} came into town raving about a {THING} they saw at the {PLACE}. They left before morning without their horse.',
  'They found the {NPC_TITLE} wandering near the {PLACE} with no memory of the last week, holding a {THING}.',
];

export const RUMOR_VARS = {
  THING: [
    'pale-eyed stranger', 'figure in a brown cloak', 'cart with no driver', 'dog the size of a horse',
    'priest in old-fashioned vestments', 'child carrying a lantern', 'man without a shadow',
    'woman speaking a language no one knows', 'wagon full of empty cages', 'flock of black birds',
    'white stag with silver antlers', 'headless horseman', 'pack of wolves that walk on two legs',
    'glowing orb of green light', 'swarm of blood-red butterflies', 'knight in rusted black armor',
    'merchant selling empty bottles', 'beggar who knows everyone\'s name', 'weeping statue', 'ghostly ship',
  ],
  PLACE: [
    'old north road', 'eastern bridge', 'mill stream', 'churchyard', 'old market square',
    'south orchard', 'broken aqueduct', 'forest edge', 'salt marsh', 'cliff path',
    'ruined watchtower', 'abandoned mine', 'crossroads at midnight', 'wishing well', 'gallows hill',
    'king\'s highway', 'smuggler\'s cove', 'weeping willow grove', 'ancient standing stones', 'burnt-out farmhouse',
  ],
  NPC_TITLE: [
    'innkeeper', 'priest', 'sergeant of the watch', 'tax-collector', 'apprentice scribe',
    'magistrate', 'cooper', 'apothecary', 'travelling tinker', 'old woman who lives by the well',
    'gravedigger', 'ferryman', 'town crier', 'master blacksmith', 'local lord',
    'blind beggar', 'midwife', 'retired mercenary', 'bard', 'baker',
  ],
  INSTITUTION: [
    'old chapel', 'town hall', 'guildhouse', 'almshouse', 'lighthouse', 'mill', 'apothecary',
    'magistrate\'s office', 'old inn at the crossroads', 'tannery',
    'orphanage', 'watchhouse', 'monastery on the hill', 'library', 'bank',
    'butcher\'s shop', 'smithy', 'local jail', 'mansion on the edge of town', 'theatre',
  ],
} as const;
