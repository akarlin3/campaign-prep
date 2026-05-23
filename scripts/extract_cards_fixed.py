import sys

with open('components/CampaignEditor.tsx', 'r') as f:
    lines = f.readlines()

def get_slice(start, end):
    return "".join(lines[start-1:end])

card_label = get_slice(376, 378)
faction_card = get_slice(380, 444)
goal_card = get_slice(446, 464)
npc_field_row = get_slice(466, 498)
npc_card = get_slice(500, 568)
location_card = get_slice(570, 658)
session_log_card = get_slice(660, 701)
clock_card = get_slice(703, 758)
downtime_types = get_slice(760, 856)
downtime_card = get_slice(858, 907)

cards_code = "\n".join([
    card_label, faction_card, goal_card, npc_field_row,
    npc_card, location_card, session_log_card, clock_card,
    downtime_types, downtime_card
])

# Add exports
import re
cards_code = re.sub(r'^(const [A-Z])', r'export \1', cards_code, flags=re.MULTILINE)

imports = """import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { Field, ListField, Inspire, CardLabel } from '../CampaignEditor'; // We will export these from CampaignEditor
import type { SessionLog, DowntimeEntry } from '@/lib/types';
import { renownRank } from '../CampaignEditor';
"""

with open('components/plan/Cards.tsx', 'w') as f:
    f.write(imports + "\n" + cards_code)

# Remove the lines
# Ranges to KEEP (1-indexed): 1 to 375, 379, 445, 465, 499, 569, 659, 702, 759, 857, 908 to EOF
# Wait, some of these single lines are just blank lines.
# It is simpler to keep:
keep_lines = lines[:375] + [lines[378]] + [lines[444]] + [lines[464]] + [lines[498]] + [lines[568]] + [lines[658]] + [lines[701]] + [lines[758]] + [lines[856]] + lines[907:]

with open('components/CampaignEditor.tsx', 'w') as f:
    f.writelines(keep_lines)

print("Cards extracted successfully!")
