import fs from 'fs';

const content = fs.readFileSync('components/CampaignEditor.tsx', 'utf8');
const lines = content.split('\n');

function getBlockLines(startStr, endStr) {
  const start = lines.findIndex(l => l.startsWith(startStr));
  if (start === -1) return [];
  const end = lines.findIndex((l, i) => i >= start && l.includes(endStr));
  if (end === -1) return [];
  
  const block = lines.slice(start, end + 1);
  for(let i = start; i <= end; i++) lines[i] = null;
  return block;
}

const blocks = [
  getBlockLines('const CardLabel =', ');'),
  getBlockLines('const FactionCard =', '};'),
  getBlockLines('const GoalCard =', ');'),
  getBlockLines('const NPCFieldRow =', ');'),
  getBlockLines('const NPCCard =', '};'),
  getBlockLines('const LocationCard =', ');'),
  getBlockLines('const SessionLogCard =', ');'),
  getBlockLines('const ClockCard =', '};'),
  getBlockLines('const DOWNTIME_TYPES:', '];'),
  getBlockLines('const DowntimeCard =', '};'),
];

const cardsContent = `import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { Field, ListField, Inspire } from './PlanUI'; // Will fix later if needed or import from CampaignEditor
import type { SessionLog, DowntimeEntry } from '@/lib/types';
import { renownRank } from '@/components/CampaignEditor'; // wait, renownRank is in CampaignEditor

` + blocks.map(b => b.join('\n').replace(/^const /gm, 'export const ')).join('\n\n');

fs.writeFileSync('components/plan/Cards.tsx', cardsContent);

// Remove the null lines
const newEditorContent = lines.filter(l => l !== null).join('\n');
fs.writeFileSync('components/CampaignEditor.tsx', newEditorContent);
