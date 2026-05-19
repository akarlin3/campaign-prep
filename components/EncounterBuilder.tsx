'use client';

import { useMemo, useState, useEffect } from 'react';
import { Swords, Users, RotateCcw } from 'lucide-react';
import {
  partyThresholds,
  suggestEncounters,
  parseLevelFromClassLevel,
  DIFFICULTIES,
  type Difficulty,
  type PartyMember,
  type EncounterCombo,
} from '@/lib/encounterMath';
import type { Character } from '@/lib/character-schema';

type DerivedParty = {
  members: PartyMember[];
  // Per-row info for the UI
  rows: Array<{
    name: string;
    role: 'PC' | 'Sidekick';
    level: number;
    gestalt: boolean;
    weight: number;
    parsedOk: boolean;
  }>;
};

function deriveParty(characters: Character[] | undefined): DerivedParty {
  const members: PartyMember[] = [];
  const rows: DerivedParty['rows'] = [];
  if (!characters) return { members, rows };

  for (const c of characters) {
    const hasName = !!c.name.trim();
    if (c.isSidekick) {
      const lvl = Math.max(1, Math.min(20, c.sidekickLevel || 1));
      if (!hasName && lvl === 1 && !c.sidekickClass) continue;
      members.push({ level: lvl, weight: 0.5, gestalt: false });
      rows.push({
        name: c.name.trim() || '(unnamed sidekick)',
        role: 'Sidekick',
        level: lvl,
        gestalt: false,
        weight: 0.5,
        parsedOk: true,
      });
    } else {
      const parsed = parseLevelFromClassLevel(c.classLevel);
      const hasContent = hasName || !!c.classLevel.trim() || !!c.race.trim();
      if (!hasContent) continue;
      const lvl = parsed ?? 1;
      members.push({ level: lvl, weight: 1, gestalt: !!c.gestalt });
      rows.push({
        name: c.name.trim() || '(unnamed)',
        role: 'PC',
        level: lvl,
        gestalt: !!c.gestalt,
        weight: 1,
        parsedOk: parsed != null,
      });
    }
  }
  return { members, rows };
}

const DIFFICULTY_STYLES: Record<Difficulty, { label: string; bar: string; chip: string }> = {
  easy: {
    label: 'Easy',
    bar: 'bg-emerald-700/80',
    chip: 'text-emerald-800 bg-emerald-100/60 border-emerald-700/40',
  },
  medium: {
    label: 'Medium',
    bar: 'bg-yellow-700/80',
    chip: 'text-yellow-800 bg-yellow-100/60 border-yellow-700/40',
  },
  hard: {
    label: 'Hard',
    bar: 'bg-orange-700/80',
    chip: 'text-orange-800 bg-orange-100/60 border-orange-700/40',
  },
  deadly: {
    label: 'Deadly',
    bar: 'bg-red-800/80',
    chip: 'text-red-800 bg-red-100/60 border-red-700/50',
  },
};

function ComboRow({ combo }: { combo: EncounterCombo }) {
  return (
    <div className="flex items-baseline gap-2 text-xs font-serif text-ink">
      <span className="font-display tracking-wider text-ink-soft tabular-nums w-8">
        {combo.count}×
      </span>
      <span className="font-display tracking-wider">CR {combo.cr}</span>
      <span className="text-ink-mute text-[10px] ml-auto tabular-nums">
        {combo.baseXP.toLocaleString()} XP
        {combo.count > 1 && ` · ×${combo.multiplier} mult`}
        {' = '}
        {Math.round(combo.adjustedXP).toLocaleString()} XP adj.
      </span>
    </div>
  );
}

function DifficultyCard({
  difficulty,
  band,
  combos,
}: {
  difficulty: Difficulty;
  band: [number, number];
  combos: EncounterCombo[];
}) {
  const style = DIFFICULTY_STYLES[difficulty];
  return (
    <div className="rounded border border-rule bg-parchment overflow-hidden shadow-card">
      <div className={`${style.bar} px-3 py-1.5 flex items-baseline justify-between text-parchment`}>
        <span className="font-display uppercase tracking-wider text-sm">{style.label}</span>
        <span className="text-[10px] font-serif text-parchment/80 tabular-nums">
          {band[0].toLocaleString()}–{band[1].toLocaleString()} XP adj.
        </span>
      </div>
      <div className="p-3 space-y-1">
        {combos.length === 0 ? (
          <div className="text-xs font-serif italic text-ink-mute">
            No clean combinations fit this band — try adjusting the party.
          </div>
        ) : (
          combos.map((c, i) => <ComboRow key={`${c.cr}x${c.count}-${i}`} combo={c} />)
        )}
      </div>
    </div>
  );
}

type ManualParty = {
  size: number;
  level: number;
  gestalt: boolean;
  sidekicks: number;
};

const DEFAULT_MANUAL: ManualParty = { size: 1, level: 1, gestalt: false, sidekicks: 0 };

function manualToMembers(m: ManualParty): PartyMember[] {
  const out: PartyMember[] = [];
  const lvl = Math.min(20, Math.max(1, Math.round(m.level)));
  for (let i = 0; i < Math.max(0, m.size); i++) {
    out.push({ level: lvl, weight: 1, gestalt: m.gestalt });
  }
  for (let i = 0; i < Math.max(0, m.sidekicks); i++) {
    out.push({ level: lvl, weight: 0.5, gestalt: false });
  }
  return out;
}

export default function EncounterBuilder({
  characters,
}: {
  characters?: Character[];
}) {
  const derived = useMemo(() => deriveParty(characters), [characters]);
  const hasCharacters = derived.members.length > 0;

  const [useManual, setUseManual] = useState(!hasCharacters);
  const [manual, setManual] = useState<ManualParty>(DEFAULT_MANUAL);

  // If characters appear after mount (rare — usually they're already there), prefer them.
  useEffect(() => {
    if (hasCharacters) setUseManual(false);
  }, [hasCharacters]);

  const members = useMemo(
    () => (useManual || !hasCharacters ? manualToMembers(manual) : derived.members),
    [useManual, hasCharacters, manual, derived.members],
  );

  const thresholds = useMemo(() => {
    if (members.length === 0) return { easy: 0, medium: 0, hard: 0, deadly: 0 };
    return partyThresholds(members);
  }, [members]);

  const suggestions = useMemo(() => suggestEncounters(thresholds), [thresholds]);

  const bands: Record<Difficulty, [number, number]> = {
    easy: [thresholds.easy, thresholds.medium],
    medium: [thresholds.medium, thresholds.hard],
    hard: [thresholds.hard, thresholds.deadly],
    deadly: [thresholds.deadly, Math.round(thresholds.deadly * 1.5)],
  };

  const totalWeight = members.reduce((s, p) => s + p.weight, 0);
  const isSolo = totalWeight <= 1.0001 && totalWeight > 0;

  return (
    <div className="space-y-3">
      <div className="rounded border border-rule bg-parchment-soft p-3 space-y-2.5 text-xs">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Swords size={14} className="text-brass-deep" />
            <span className="font-display uppercase tracking-wider text-brass-deep">
              Encounter Builder
            </span>
            <span className="text-[10px] text-ink-mute italic font-serif">
              5e XP thresholds · pick a difficulty, get suggested CR combinations
            </span>
          </div>
          {hasCharacters && (
            <div
              role="tablist"
              aria-label="Party source"
              className="inline-flex border border-rule rounded overflow-hidden font-display uppercase tracking-wider text-[10px]"
            >
              <button
                type="button"
                onClick={() => setUseManual(false)}
                className={`px-2 py-0.5 transition-colors flex items-center gap-1 ${
                  !useManual ? 'bg-crimson text-parchment' : 'text-ink-soft hover:bg-parchment-deep'
                }`}
              >
                <Users size={11} /> From Characters
              </button>
              <button
                type="button"
                onClick={() => setUseManual(true)}
                className={`px-2 py-0.5 border-l border-rule transition-colors ${
                  useManual ? 'bg-crimson text-parchment' : 'text-ink-soft hover:bg-parchment-deep'
                }`}
              >
                Manual
              </button>
            </div>
          )}
        </div>

        {useManual || !hasCharacters ? (
          <ManualPartyControls
            value={manual}
            onChange={setManual}
            onReset={() => setManual(DEFAULT_MANUAL)}
            note={
              !hasCharacters
                ? 'No characters added yet — enter party details manually.'
                : undefined
            }
          />
        ) : (
          <DerivedPartySummary rows={derived.rows} />
        )}

        <div className="border-t border-rule pt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-serif">
          {DIFFICULTIES.map((d) => {
            const style = DIFFICULTY_STYLES[d];
            return (
              <div
                key={d}
                className={`rounded-sm border px-2 py-1 flex flex-col gap-0.5 ${style.chip}`}
              >
                <span className="font-display uppercase tracking-wider text-[10px]">
                  {style.label}
                </span>
                <span className="tabular-nums">
                  {bands[d][0].toLocaleString()}–{bands[d][1].toLocaleString()} XP
                </span>
              </div>
            );
          })}
        </div>

        {isSolo && (
          <div className="text-[10px] italic font-serif text-ink-mute border-t border-rule pt-1.5">
            Solo party detected — non-gestalt thresholds are reduced to 0.75× to account for the
            missing action economy.
          </div>
        )}
      </div>

      {members.length === 0 ? (
        <div className="rounded border border-dashed border-rule bg-parchment-soft p-6 text-center text-ink-mute text-sm font-serif italic">
          Add at least one party member to see suggested encounters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DIFFICULTIES.map((d) => (
            <DifficultyCard
              key={d}
              difficulty={d}
              band={bands[d]}
              combos={suggestions[d]}
            />
          ))}
        </div>
      )}

      <div className="text-[10px] text-ink-mute italic font-serif">
        Adjusted XP = base XP × count × group multiplier (1·×1, 2·×1.5, 3–6·×2, 7–10·×2.5, 11–14·×3, 15+·×4).
      </div>
    </div>
  );
}

function DerivedPartySummary({ rows }: { rows: DerivedParty['rows'] }) {
  return (
    <div className="space-y-1">
      <div className="font-display uppercase tracking-wider text-[10px] text-brass-deep">
        Party (from characters)
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-0.5 gap-x-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-baseline gap-2 text-[11px] font-serif text-ink">
            <span className="text-ink-soft">{r.role === 'Sidekick' ? '½' : '•'}</span>
            <span className="truncate">{r.name}</span>
            <span className="text-ink-mute tabular-nums">
              Lv {r.level}
              {r.gestalt && ' · gestalt'}
              {!r.parsedOk && r.role === 'PC' && ' · level unset, defaulted to 1'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function NumberInput({
  value,
  min,
  max,
  onChange,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => {
        const v = parseInt(e.target.value || `${min}`, 10);
        onChange(Math.max(min, Math.min(max, Number.isFinite(v) ? v : min)));
      }}
      className={`bg-parchment border border-rule rounded-sm px-2 py-1 text-sm text-ink font-serif focus:border-brass-deep focus:outline-none ${
        className ?? 'w-16'
      }`}
    />
  );
}

function ManualPartyControls({
  value,
  onChange,
  onReset,
  note,
}: {
  value: ManualParty;
  onChange: (v: ManualParty) => void;
  onReset: () => void;
  note?: string;
}) {
  return (
    <div className="space-y-1.5">
      {note && (
        <div className="text-[11px] italic font-serif text-ink-soft">{note}</div>
      )}
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <div className="font-display uppercase tracking-wider text-[10px] text-brass-deep mb-1">
            PCs
          </div>
          <NumberInput value={value.size} min={0} max={8} onChange={(n) => onChange({ ...value, size: n })} />
        </div>
        <div>
          <div className="font-display uppercase tracking-wider text-[10px] text-brass-deep mb-1">
            Sidekicks
          </div>
          <NumberInput value={value.sidekicks} min={0} max={8} onChange={(n) => onChange({ ...value, sidekicks: n })} />
        </div>
        <div>
          <div className="font-display uppercase tracking-wider text-[10px] text-brass-deep mb-1">
            Avg. Level
          </div>
          <NumberInput value={value.level} min={1} max={20} onChange={(n) => onChange({ ...value, level: n })} />
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer select-none font-display uppercase tracking-wider text-ink-soft">
          <input
            type="checkbox"
            checked={value.gestalt}
            onChange={(e) => onChange({ ...value, gestalt: e.target.checked })}
            className="accent-crimson"
          />
          Gestalt PCs
        </label>
        <button
          type="button"
          onClick={onReset}
          className="ml-auto text-[10px] font-display uppercase tracking-wider text-ink-mute hover:text-crimson flex items-center gap-1"
        >
          <RotateCcw size={11} /> Reset
        </button>
      </div>
    </div>
  );
}

