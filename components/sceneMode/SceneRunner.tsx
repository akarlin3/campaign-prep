'use client';

import { Sparkles, Send, X, Square, Download } from 'lucide-react';
import type { SceneEntry } from '@/lib/scene/types';
import type { PlayerCharacter } from '@/lib/pc/types';
import TurnCard from './TurnCard';

// Live narration preview shown while the turn streams in. Kept separate from
// the recorded TurnCards so the two rendering concerns don't tangle.
function StreamingPreview({ streamText }: { streamText: string }) {
  return (
    <div className="rounded border border-rule bg-parchment p-3 shadow-card">
      <span className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wider text-brass-deep">
        <Sparkles size={12} className="text-crimson" /> Narrating…
      </span>
      {streamText && (
        <pre className="mt-1.5 whitespace-pre-wrap font-serif text-xs leading-relaxed text-ink-mute">
          {streamText}
        </pre>
      )}
    </div>
  );
}

export type SceneRunnerProps = {
  scene: SceneEntry;
  party: PlayerCharacter[];
  npcName: (id: string) => string;
  locationName: (id: string) => string;
  pcAction: string;
  setPcAction: (v: string) => void;
  streaming: boolean;
  streamText: string;
  error: string | null;
  onSend: () => void;
  onCancel: () => void;
  onApplyRoll: (sceneId: string, turnId: string, modifier: number, dc: number) => void;
  onSetOutcome: (sceneId: string, turnId: string, outcome: string) => void;
  onEnd: () => void;
  onExport: () => void;
  onBack: () => void;
};

export default function SceneRunner({
  scene,
  party,
  npcName,
  locationName,
  pcAction,
  setPcAction,
  streaming,
  streamText,
  error,
  onSend,
  onCancel,
  onApplyRoll,
  onSetOutcome,
  onEnd,
  onExport,
  onBack,
}: SceneRunnerProps) {
  return (
    <div className="space-y-3 text-sm" data-scene-status={scene.status}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="font-display text-xs uppercase tracking-wider text-ink-mute hover:text-ink"
        >
          ← Scenes
        </button>
        <span className="min-w-0 flex-1 truncate font-display text-sm text-ink">
          {locationName(scene.locationId)}
        </span>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-1 font-display text-[10px] uppercase tracking-wider text-ink-mute hover:text-brass-deep"
        >
          <Download size={10} /> Export
        </button>
        <button
          type="button"
          onClick={onEnd}
          className="flex items-center gap-1 rounded border border-crimson/50 px-2.5 py-1 font-display text-[10px] uppercase tracking-wider text-crimson hover:bg-crimson hover:text-parchment"
        >
          <Square size={10} /> End Scene
        </button>
      </div>

      <div className="font-serif text-xs italic text-ink-mute">
        Present: {scene.presentNpcIds.map(npcName).join(', ')}
      </div>

      <div className="space-y-3">
        {scene.turns.map((turn, i) => (
          <TurnCard
            key={turn.id}
            turn={turn}
            index={i}
            sceneId={scene.id}
            party={party}
            npcName={npcName}
            onApplyRoll={onApplyRoll}
            onSetOutcome={onSetOutcome}
          />
        ))}

        {streaming && <StreamingPreview streamText={streamText} />}

        {error && (
          <div className="rounded border border-crimson/40 bg-crimson/5 p-2.5 font-serif text-xs text-crimson">
            {error}
          </div>
        )}
      </div>

      {/* Player input — amber/brass treatment per UI convention. */}
      <div className="space-y-1.5 rounded border border-brass-deep/40 bg-brass/10 p-2.5">
        <span className="font-display text-[10px] uppercase tracking-wider text-brass-deep">
          What does your PC do?
        </span>
        <textarea
          name="pcAction"
          value={pcAction}
          onChange={(e) => setPcAction(e.target.value)}
          rows={2}
          placeholder="Describe your action…"
          className="w-full resize-y rounded border border-rule bg-parchment px-2 py-1.5 font-serif text-sm text-ink placeholder:italic placeholder:text-ink-faint focus:border-crimson focus:outline-none"
        />
        <button
          type="button"
          onClick={streaming ? onCancel : onSend}
          disabled={!streaming && !pcAction.trim()}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 font-display text-xs uppercase tracking-wider transition-colors ${
            streaming
              ? 'border-crimson bg-crimson/10 text-crimson hover:bg-crimson hover:text-parchment'
              : 'border-crimson bg-crimson text-parchment hover:bg-crimson-deep disabled:cursor-not-allowed disabled:opacity-40'
          }`}
        >
          {streaming ? (
            <>
              <X size={12} /> Cancel
            </>
          ) : (
            <>
              <Send size={12} /> Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}
