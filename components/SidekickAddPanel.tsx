'use client';

import { useState } from 'react';
import { Plus, Sparkles, UserPlus } from 'lucide-react';
import { LockedInline } from './LockedFeature';
import {
  SIDEKICK_CLASSES,
  SPELL_LISTS,
  BASE_CREATURES,
  buildSidekickPrefill,
  type SidekickClass,
  type SpellList,
  type SidekickBaseId,
} from '@/lib/sidekicks';
import {
  emptyCharacter,
  makeCharacterId,
  normalizeCharacter,
  type Character,
} from '@/lib/character-schema';
import { getFirebaseAuth } from '@/lib/firebase/client';

type Props = {
  isPro: boolean;
  onAdd: (c: Character) => void;
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] text-brass-deep font-display uppercase tracking-wider mb-0.5">
      {children}
    </div>
  );
}

const selectClass =
  'w-full bg-parchment border border-rule rounded px-2 py-1 text-sm font-serif text-ink focus:outline-none focus:border-crimson';

export default function SidekickAddPanel({ isPro, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState<SidekickClass>('warrior');
  const [spellList, setSpellList] = useState<SpellList>('mage');
  const [level, setLevel] = useState<number>(1);
  const [baseId, setBaseId] = useState<SidekickBaseId>('commoner');
  const [concept, setConcept] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const isSpellcaster = classId === 'spellcaster';
  const effectiveSpellList: SpellList | '' = isSpellcaster ? spellList : '';

  function buildBase(): Character {
    const pre = buildSidekickPrefill({
      classId,
      level,
      spellList: effectiveSpellList,
      baseId,
    });
    const empty = emptyCharacter();
    return {
      ...empty,
      id: makeCharacterId(),
      isSidekick: true,
      sidekickClass: classId,
      sidekickSpellList: effectiveSpellList,
      sidekickBase: baseId,
      sidekickLevel: level,
      race: pre.race,
      classLevel: pre.classLevel,
      background: pre.background,
      abilities: pre.abilities,
      saves: pre.saves,
      ac: pre.ac,
      hp: pre.hp,
      hpMax: pre.hpMax,
      initiative: pre.initiative,
      speed: pre.speed,
      profBonus: pre.profBonus,
      hitDice: pre.hitDice,
      skills: pre.skills,
      languages: pre.languages,
      proficiencies: pre.proficiencies,
      equipment: pre.equipment,
      features: pre.features,
      spellcasting: pre.spellcasting,
      spells: pre.spells,
      notes: pre.notes,
    };
  }

  function addTemplate() {
    setError('');
    onAdd(buildBase());
    setConcept('');
  }

  async function generateWithAi() {
    setError('');
    if (!concept.trim()) {
      setError('Add a concept (e.g. "retired soldier who joined after his town burned").');
      return;
    }
    setGenerating(true);
    try {
      const user = getFirebaseAuth().currentUser;
      if (!user) throw new Error('Not signed in');
      const idToken = await user.getIdToken();
      const res = await fetch('/api/generate-sidekick', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId,
          level,
          spellList: effectiveSpellList,
          baseId,
          concept: concept.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Generate failed (${res.status})`);
      const parsed = normalizeCharacter(body.character);
      const sidekick: Character = {
        ...parsed,
        id: makeCharacterId(),
        isSidekick: true,
        sidekickClass: classId,
        sidekickSpellList: effectiveSpellList,
        sidekickBase: baseId,
        sidekickLevel: level,
      };
      onAdd(sidekick);
      setConcept('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generate failed';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-wine hover:text-crimson flex items-center gap-1 font-display uppercase tracking-wider"
        title="Build a Tasha sidekick (solo-mode companion)"
      >
        <UserPlus size={12} /> Add Sidekick
      </button>
    );
  }

  return (
    <div className="w-full rounded border border-wine/40 bg-wine/[0.04] p-3 space-y-3 my-2">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-display uppercase tracking-wider text-wine flex items-center gap-1.5">
          <UserPlus size={12} /> Add Sidekick (Tasha's Cauldron)
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-[10px] text-ink-mute hover:text-crimson font-display uppercase tracking-wider"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <Label>Class</Label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value as SidekickClass)}
            className={selectClass}
          >
            {SIDEKICK_CLASSES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {isSpellcaster && (
          <div>
            <Label>Spell List</Label>
            <select
              value={spellList}
              onChange={(e) => setSpellList(e.target.value as SpellList)}
              className={selectClass}
            >
              {SPELL_LISTS.map((l) => (
                <option key={l.id} value={l.id}>{l.name} ({l.list})</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <Label>Level</Label>
          <select
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value, 10))}
            className={selectClass}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Base Stat Block</Label>
          <select
            value={baseId}
            onChange={(e) => setBaseId(e.target.value as SidekickBaseId)}
            className={selectClass}
          >
            {BASE_CREATURES.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-[11px] text-ink-soft font-serif italic">
        {SIDEKICK_CLASSES.find((c) => c.id === classId)?.blurb}
        {isSpellcaster && ` · ${SPELL_LISTS.find((l) => l.id === spellList)?.blurb}`}
      </div>

      <div>
        <Label>Concept (used by AI generate)</Label>
        <textarea
          value={concept}
          onChange={(e) => setConcept(e.target.value)}
          placeholder='e.g. "Grizzled retired soldier who joined the party after his village burned. Quiet, loyal, secretly afraid of fire."'
          rows={3}
          className="w-full bg-parchment border border-rule rounded px-2 py-1.5 text-sm font-serif text-ink placeholder:text-ink-faint placeholder:italic focus:outline-none focus:border-crimson resize-none [field-sizing:content]"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={addTemplate}
          className="text-xs px-2.5 py-1 rounded border border-brass-deep/50 text-brass-deep hover:bg-brass hover:text-parchment hover:border-brass font-display uppercase tracking-wider flex items-center gap-1.5"
          title="Prefill a sidekick card from Tasha class tables — no AI"
        >
          <Plus size={12} /> Add from Template
        </button>

        {isPro ? (
          <button
            onClick={generateWithAi}
            disabled={generating}
            className="text-xs px-2.5 py-1 rounded border border-crimson/60 text-crimson hover:bg-crimson hover:text-parchment hover:border-crimson font-display uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-wait"
            title="Use Claude to fill name, race, ability scores, equipment, personality and backstory from your concept"
          >
            <Sparkles size={12} /> {generating ? 'Generating…' : 'Generate with AI'}
          </button>
        ) : (
          <LockedInline label="Generate with AI" />
        )}

        {error && (
          <span className="text-xs text-crimson italic" title={error}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
