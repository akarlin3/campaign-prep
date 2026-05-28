'use client';

// Presentational constants extracted from PlayerCampaignView: tab metadata and
// the preferred field ordering per entity type. These are pure data with no
// component state, so they live at module scope here.

import React from 'react';
import { UserCircle, Users, Map, Flag, Clock } from 'lucide-react';

// Tab label + icon per entity type, in display order.
export const TYPE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  characters: { label: 'Party', icon: <UserCircle size={15} /> },
  pcs: { label: 'Party Sheets', icon: <UserCircle size={15} /> },
  npcs: { label: 'NPCs', icon: <Users size={15} /> },
  locations: { label: 'Places', icon: <Map size={15} /> },
  factions: { label: 'Factions', icon: <Flag size={15} /> },
  clocks: { label: 'Clocks', icon: <Clock size={15} /> },
};

// Preferred render order for fields on each entity type. Fields not listed fall
// back to alphabetical order after the listed ones (see EntityCard).
export const FIELD_ORDER: Record<string, string[]> = {
  characters: [
    'player', 'race', 'classLevel', 'classLevel2', 'background', 'alignment',
    'appearance', 'personality', 'ideals', 'bonds', 'flaws', 'abilities',
    'saves', 'ac', 'hp', 'hpMax', 'initiative', 'speed', 'profBonus', 'hitDice',
    'skills', 'passivePerception', 'languages', 'proficiencies', 'attacks',
    'equipment', 'currency', 'features', 'spellcasting', 'spells', 'experience',
    'backstory', 'notes'
  ],
  pcs: [
    'level', 'hp', 'ac', 'conditions'
  ],
  npcs: [
    'faction', 'archetype', 'appearance', 'talent', 'mannerism', 'type',
    'goal', 'method', 'abilities', 'interactions', 'knowledge', 'ideal',
    'bond', 'flaw'
  ],
  locations: [
    'type', 'aspects', 'factions'
  ],
  factions: [
    'archetype', 'identity', 'area', 'power', 'ideology', 'shortGoals',
    'midGoals', 'longGoal', 'renown', 'rankLabels'
  ],
  clocks: [
    'faction', 'max', 'filled', 'notes'
  ],
};

// 5e exhaustion-level descriptions shown beneath the exhaustion tracker.
export const EXHAUSTION_LABELS: Record<number, string> = {
  0: 'Normal state (no active effects)',
  1: 'Level 1: Disadvantage on ability checks',
  2: 'Level 2: Speed halved (+ Level 1)',
  3: 'Level 3: Disadvantage on attack rolls & saves (+ Levels 1-2)',
  4: 'Level 4: Hit point maximum halved (+ Levels 1-3)',
  5: 'Level 5: Speed reduced to 0 (+ Levels 1-4)',
};

// Standard 5e conditions the player can toggle on their own sheet.
export const CONDITION_OPTIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled', 'Incapacitated',
  'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained',
  'Stunned', 'Unconscious',
];

export const ABILITY_KEYS = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];

export const PC_ROLEPLAY_FIELDS = ['goals', 'bonds', 'ideals', 'flaws'] as const;
