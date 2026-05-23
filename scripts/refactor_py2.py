import sys
import re

with open('components/CampaignEditor.tsx', 'r') as f:
    lines = f.readlines()

def get_slice(start, end):
    return "".join(lines[start-1:end])

ui_block1 = get_slice(105, 1064)
ui_block2 = get_slice(1955, 1974)
ui_block3 = get_slice(1976, 1993)

all_ui_code = ui_block1 + "\n" + ui_block2 + "\n" + ui_block3

# Prepend export to top-level const and function declarations
all_ui_code = re.sub(r'^(const [A-Z])', r'export \1', all_ui_code, flags=re.MULTILINE)
all_ui_code = re.sub(r'^(function renownRank)', r'export \1', all_ui_code, flags=re.MULTILINE)

imports = """import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import type { EncounterCalcState, EncounterMonster, DowntimeEntry, SessionLog } from '@/lib/types';
"""

plan_ui_content = imports + "\n" + all_ui_code

with open('components/plan/PlanUI.tsx', 'w') as f:
    f.write(plan_ui_content)

# Remove the lines from CampaignEditor.tsx
# Lines to keep (1-indexed): 1 to 104, 1065 to 1954, 1994 to EOF
new_lines = lines[:104] + lines[1064:1954] + lines[1993:]

with open('components/CampaignEditor.tsx', 'w') as f:
    f.writelines(new_lines)

print("Extraction completed successfully!")
