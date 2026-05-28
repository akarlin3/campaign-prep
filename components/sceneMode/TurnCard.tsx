'use client';

import { useState } from 'react';
import { AlertTriangle, Dice5 } from 'lucide-react';
import type { SceneTurn } from '@/lib/scene/types';
import { rollLabel } from '@/lib/scene/roll';
import { modifierForSuggestion } from '@/lib/scene/roll-with-modifiers';
import { formatMod } from '@/lib/pc/derived';
import type { PlayerCharacter } from '@/lib/pc/types';

export type TurnCardProps = {
  turn: SceneTurn;
  index: number;
  sceneId: string;
  party: PlayerCharacter[];
  npcName: (id: string) => string;
  onApplyRoll: (sceneId: string, turnId: string, modifier: number, dc: number) => void;
  onSetOutcome: (sceneId: string, turnId: string, outcome: string) => void;
};

export default function TurnCard({
  turn,
  index,
  sceneId,
  party,
  npcName,
  onApplyRoll,
  onSetOutcome,
}: TurnCardProps) {
  const [modifier, setModifier] = useState(0);
  const [rollOpen, setRollOpen] = useState(false);
  const [pickPc, setPickPc] = useState(false);
  const roll = turn.response.suggestedRoll;

  // Roll the suggestion against a specific PC: resolve the ability mod +
  // proficiency bonus (when proficient in the suggested skill) and apply.
  const rollWithPc = (pc: PlayerCharacter) => {
    if (!roll) return;
    onApplyRoll(sceneId, turn.id, modifierForSuggestion(pc, roll), roll.dc);
    setRollOpen(false);
    setPickPc(false);
  };

  return (
    <div className="space-y-2" data-turn-index={index} data-status="complete">
      <div className="rounded border border-brass-deep/30 bg-brass/10 px-2.5 py-1.5 font-serif text-sm text-ink">
        <span className="font-display text-[10px] uppercase tracking-wider text-brass-deep">
          PC
        </span>
        <div>{turn.pcAction}</div>
      </div>

      <div className="space-y-2 rounded border border-rule bg-parchment p-3 shadow-card">
        {turn.response.dialogue.map((d, di) => (
          <div key={di} className="font-serif text-sm leading-relaxed text-ink">
            <span className="font-display text-xs uppercase tracking-wider text-crimson">
              {npcName(d.npcId)}:
            </span>{' '}
            <span className="italic">&ldquo;{d.line}&rdquo;</span>
          </div>
        ))}
        <p className="font-serif text-sm leading-relaxed text-ink-soft">{turn.response.sensory}</p>

        {turn.voiceWarnings?.map((w, wi) => (
          <div
            key={wi}
            className="flex items-start gap-1.5 rounded border border-brass-deep/50 bg-brass/15 px-2 py-1 font-serif text-xs text-brass-deep"
          >
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            <span>
              <b>{npcName(w.npcId)}</b> — {w.reason}
            </span>
          </div>
        ))}

        {roll && (
          <div className="space-y-1.5 border-t border-rule pt-2">
            {turn.rolled ? (
              <div className="font-serif text-xs text-ink-soft">
                <Dice5 size={12} className="mr-1 inline text-brass-deep" />
                {turn.rolled.expr} = <b>{turn.rolled.result}</b> vs DC {roll.dc} —{' '}
                <span className={turn.rolled.success ? 'text-moss' : 'text-crimson'}>
                  {turn.rolled.success === null ? '—' : turn.rolled.success ? 'Success' : 'Failure'}
                </span>
              </div>
            ) : rollOpen ? (
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-serif text-xs text-ink-soft">1d20 +</span>
                  <input
                    type="number"
                    value={modifier}
                    onChange={(e) => setModifier(Number(e.target.value) || 0)}
                    className="w-14 rounded border-b border-rule bg-transparent px-1 py-0.5 text-center font-serif text-ink focus:border-crimson focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onApplyRoll(sceneId, turn.id, modifier, roll.dc);
                      setRollOpen(false);
                    }}
                    className="rounded border border-crimson bg-crimson px-2 py-0.5 font-display text-[10px] uppercase tracking-wider text-parchment hover:bg-crimson-deep"
                  >
                    Roll
                  </button>
                  {party.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (party.length === 1) rollWithPc(party[0]);
                        else setPickPc((v) => !v);
                      }}
                      className="rounded border border-brass-deep/50 px-2 py-0.5 font-display text-[10px] uppercase tracking-wider text-brass-deep hover:bg-brass hover:text-parchment"
                      title="Roll using a PC's ability/skill modifier"
                    >
                      Roll With Modifiers
                    </button>
                  )}
                </div>
                {pickPc && party.length > 1 && (
                  <div className="flex flex-wrap gap-1">
                    {party.map((pc) => (
                      <button
                        key={pc.id}
                        type="button"
                        onClick={() => rollWithPc(pc)}
                        className="rounded border border-rule px-2 py-0.5 font-serif text-[11px] text-ink-soft hover:bg-parchment-deep"
                      >
                        {pc.name || 'Unnamed'} ({formatMod(modifierForSuggestion(pc, roll))})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRollOpen(true)}
                className="flex items-center gap-1.5 rounded border border-brass-deep/50 px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-brass-deep hover:bg-brass hover:text-parchment"
                title={roll.reason}
              >
                <Dice5 size={11} /> {rollLabel(roll)}
              </button>
            )}
            <p className="font-serif text-[11px] italic text-ink-mute">{roll.reason}</p>
          </div>
        )}

        <input
          type="text"
          defaultValue={turn.outcome ?? ''}
          onBlur={(e) => onSetOutcome(sceneId, turn.id, e.target.value)}
          placeholder="What actually happened? (optional)"
          className="w-full rounded border border-rule bg-parchment-soft px-2 py-1 font-serif text-xs text-ink placeholder:italic placeholder:text-ink-faint focus:border-crimson focus:outline-none"
        />
      </div>
    </div>
  );
}
