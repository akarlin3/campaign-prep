// Settlement tables — ORIGINAL CONTENT.
//
// Source / licensing: no DMG content. Population bands, government types,
// economies, settlement name parts, notable-NPC role pool, and hook table
// are original prose.

import type { SettlementSizeClass } from '../types';

export const SIZE_POPULATION_BANDS: Record<SettlementSizeClass, { min: number; max: number; notables: number }> = {
  thorp:        { min: 4,     max: 20,    notables: 1 },
  hamlet:       { min: 21,    max: 60,    notables: 2 },
  village:      { min: 61,    max: 200,   notables: 2 },
  town:         { min: 201,   max: 2000,  notables: 3 },
  'small city': { min: 2001,  max: 10000, notables: 4 },
  'large city': { min: 10001, max: 25000, notables: 5 },
  metropolis:   { min: 25001, max: 250000, notables: 5 },
};

export const GOVERNMENT_TYPES: readonly string[] = [
  'hereditary monarchy in name; council in practice',
  'elected council of guild masters',
  'autocratic baron or baroness, recently appointed',
  'theocratic — the head temple speaks for the people',
  'magocratic — a chartered guild of mages',
  'open council of citizens, voting in person',
  'absent ruler; a steward governs day-to-day',
  'mercantile oligarchy of the three richest houses',
  'a single hereditary mayor whose office is older than the town walls',
  'a recent rebellion; the new government is shaky',
  'matriarchal council of elder women',
  'a foreign-installed governor and a local magistrate who actually runs things',
  'guild monopoly; the chartered guild rules in all but name',
  'no formal government; old custom holds the peace',
];

export const ECONOMIES: readonly string[] = [
  'salt and fish from the coast',
  'wheat, barley, and an annual fair',
  'sheep, wool, and the weavers\' guild',
  'iron ore from the hills and the work of a single smithy',
  'timber from the long forests to the north',
  'wine from the south-facing slopes',
  'silver and copper from a small played-out mine',
  'caravan trade — the road is the town',
  'river barges and the lock fees they pay',
  'the temple is the largest single employer',
  'a single ducal household and the servants and trades that follow them',
  'tin and pewter from the marshes',
  'cattle and the seasonal drovers\' road',
  'apples, cider, and dried fruit shipped east',
  'cloth-dyeing — the river runs colours twice a year',
  'glass, blown in a single hot shop by a family that does not share secrets',
  'leather, tanned cheaply because the river is downhill',
  'mercenary recruiting; the army comes here to find soldiers',
  'pilgrimage — the chapel draws coin from outside the valley',
  'no notable export; the place subsists on itself',
];

export const NOTABLE_ROLES: readonly string[] = [
  'magistrate', 'high priest', 'master smith', 'master weaver', 'innkeeper',
  'caravan-master', 'sergeant of the watch', 'guild secretary', 'apothecary',
  'minor noble', 'eldest of the council', 'court bard', 'master of the granary',
  'town crier', 'physician', 'horse-master', 'travelling judge',
  'wizard-in-residence', 'temple acolyte rising in influence', 'tax-collector',
  'master mason', 'old woman who lives by the gate and is consulted on all questions',
  'foreign merchant who has been here too long to leave', 'master cooper',
  'guild treasurer', 'retired admiral come to die here',
];

export const HOOKS: readonly string[] = [
  'A long-respected family has begun selling off its land at unreasonable prices.',
  'The river\'s been running brown for two weeks and the priests will not say why.',
  'A child went missing last month, and was found yesterday — alive, unhurt, and unable to say where they had been.',
  'The local lord has sent two riders to the capital who never arrived. He has sent no more.',
  'A foreign delegation has appeared without warning and is being housed at the magistrate\'s expense.',
  'The annual harvest festival has been cancelled, and nobody will say by whose order.',
  'A new building has begun rising at the centre of town. There is no obvious builder.',
  'The bell at the temple has rung three times after midnight on consecutive nights.',
  'Trade caravans have begun avoiding the road through town, and merchants are quietly leaving.',
  'A long-disused gate at the edge of the town walls has been re-hung, fresh iron and oil.',
  'A figure has been seen on the bridge each night for the past week, walking the same circuit.',
  'The watch has been doubled, but no one has been told why.',
  'A claim of an ancestor\'s right has been laid to a piece of common land; the council is divided.',
  'A noble guest is staying at the inn and refuses to give a name.',
  'Two rival masters of the same guild have begun bidding for the same apprentice; the apprentice will not say why they are so coveted.',
  'A foreign cult has opened a small chapter house, paying generous coin to local craftspeople.',
  'A plague of small ailments — cracked lips, restless sleep, mild fevers — has spread, with no obvious cause.',
  'A merchant convoy returned with a covered wagon they will not open in the marketplace.',
  'The road north has been closed for a month; the steward calls it bandits, but no traveller arrives from that direction either.',
  'The wells have a faint salt taste they did not have last year.',
];

export const NAME_PREFIXES: readonly string[] = [
  'Ash', 'Bell', 'Black', 'Bridge', 'Bright', 'Burn', 'Clear', 'Cole', 'Cross',
  'Deep', 'Down', 'East', 'Elm', 'Fair', 'Far', 'Fern', 'Ford', 'Fort', 'Gate',
  'Green', 'Grey', 'Hawk', 'High', 'Hollow', 'Iron', 'Last', 'Long', 'Low',
  'Marsh', 'Moss', 'New', 'North', 'Oak', 'Old', 'Over', 'Pine', 'Quiet',
  'Red', 'Salt', 'Sharp', 'Short', 'Sil', 'South', 'Steep', 'Stone', 'Three',
  'Tin', 'Under', 'West', 'White', 'Wild', 'Wood',
];

export const NAME_SUFFIXES: readonly string[] = [
  'bridge', 'brook', 'burn', 'bury', 'chester', 'combe', 'cove', 'cross',
  'dale', 'down', 'fall', 'field', 'ford', 'gate', 'glen', 'hall', 'hill',
  'holm', 'hope', 'keep', 'lake', 'march', 'mere', 'mill', 'minster', 'moor',
  'mouth', 'pool', 'reach', 'rest', 'ridge', 'shore', 'side', 'spire', 'stead',
  'stone', 'thorpe', 'ton', 'water', 'well', 'wood', 'wych',
];
