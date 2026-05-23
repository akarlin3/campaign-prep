const fs = require('fs');

const content = fs.readFileSync('components/CampaignEditor.tsx', 'utf8');
const lines = content.split('\n');

function getBlock(startStr, endStr, startIdx = 0) {
  let start = -1;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].startsWith(startStr)) {
      start = i;
      break;
    }
  }
  if (start === -1) return { start: -1, end: -1, text: '' };
  
  let end = -1;
  let braces = 0;
  for (let i = start; i < lines.length; i++) {
    if (endStr && lines[i].includes(endStr)) {
      end = i;
      break;
    }
  }
  if (end === -1) return { start: -1, end: -1, text: '' };
  
  return { start, end, text: lines.slice(start, end + 1).join('\n') };
}

// Find blocks to extract to PlanUI
const blocks = [
  getBlock('const M =', '};', 0), // M
  getBlock('const Tag =', ');', 0), // Tag
  getBlock('const BookQuote =', ');', 0),
  getBlock('const SoloNote =', ');', 0),
  getBlock('const Pitfall =', ');', 0),
  getBlock('const Inspire =', '};', 0),
  getBlock('const InspireGroup =', ');', 0),
  getBlock('const TargetBar =', '};', 0),
  getBlock('const Example =', ');', 0),
  getBlock('const Field =', ');', 0),
  getBlock('const ListField =', '};', 0),
  getBlock('const Section =', ');', 0),
  getBlock('const CardLabel =', ');', 0),
  getBlock('const FactionCard =', '};', 0),
  getBlock('const GoalCard =', ');', 0),
  getBlock('const NPCFieldRow =', ');', 0),
  getBlock('const NPCCard =', '};', 0),
  getBlock('const LocationCard =', ');', 0),
  getBlock('const SessionLogCard =', '};', 0),
  getBlock('const ClockCard =', '};', 0),
  getBlock('const DOWNTIME_TYPES:', '];', 0),
  getBlock('const DowntimeCard =', '};', 0),
  getBlock('const CR_OPTIONS =', '];', 0),
  getBlock('const RATING_COLORS:', '};', 0),
  getBlock('const EncounterHelper =', '};', 0),
  getBlock('const RENOWN_RANKS:', '];', 0),
  getBlock('const AudienceBadge =', '};', 0),
  getBlock('const Phase =', ');', 0)
];

let newPlanUI = `import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  ChevronDown, ChevronRight, Check, Plus, X, Quote, 
  User, Users, Map, Swords, Gift, Layers, Calendar, Target, Trophy, 
  Download, Upload, ScrollText, ArrowLeft, ArrowRight, Cloud, CloudOff, 
  FileUp, Sparkles, Play, Search, BookOpen, Dice5, Wand2, Skull, Footprints, Hash, ClipboardList, Wrench, SlidersHorizontal, Copy, 
  Compass, NotebookPen, Zap, Gem 
} from 'lucide-react';
import { TABLES, sampleTable } from '@/lib/inspirationTables';
import { CR_TO_XP, encounterMultiplier, difficultyForSolo, parseLevelFromClassLevel } from '@/lib/encounterMath';
import { getFirebaseAuth } from '@/lib/firebase/client';
`;

// Extract plan tabs code directly based on known line numbers.
// Note: It's safer to use regex or string markers.
const premiseBlock = getBlock('{mode === \'plan\' && subview === \'pitch\' && (', ')}', 3000);
const worldbuildBlock1 = getBlock('{mode === \'plan\' && subview === \'worldbuild\' && (', ')}', 3000);
const worldbuildBlock2 = getBlock('{mode === \'plan\' && subview === \'worldbuild\' && (', ')}', worldbuildBlock1.end + 1);
const worldbuildBlock3 = getBlock('{mode === \'plan\' && subview === \'worldbuild\' && (() => {', ')}', worldbuildBlock2.end + 1);
const charactersBlock = getBlock('{mode === \'plan\' && subview === \'pcs\' && (', ')}', 3000);
const frontsBlock1 = getBlock('{mode === \'plan\' && subview === \'fronts\' && (', ')}', 3000);
const frontsBlock2 = getBlock('{mode === \'plan\' && subview === \'fronts\' && (', ')}', frontsBlock1.end + 1);

let planUIExports = [];
for (let b of blocks) {
  if (b.start === -1) {
    console.log("Failed to find block");
    continue;
  }
  let txt = b.text;
  if (txt.startsWith('const ')) txt = 'export ' + txt;
  newPlanUI += '\n' + txt + '\n';
  
  // Clear the block from lines
  for (let i = b.start; i <= b.end; i++) {
    lines[i] = null; // Mark for deletion
  }
}

fs.writeFileSync('components/plan/PlanUI.tsx', newPlanUI);
console.log('Created PlanUI.tsx');

// I will create Premise.tsx, Worldbuild.tsx, Characters.tsx, Fronts.tsx manually or in another step.
// For CampaignEditor.tsx, I will replace the inline blocks with the new components.
fs.writeFileSync('components/CampaignEditor.tsx', lines.filter(l => l !== null).join('\n'));
console.log('Updated CampaignEditor.tsx');

