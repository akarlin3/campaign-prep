'use client';

// "Premise" tab: redacted premise & worldbuilding sections. Extracted verbatim
// from PlayerCampaignView.

import React from 'react';
import type { SlotProjection } from '@/lib/playerMode/types';

export default function PlanningTab({ planning }: { planning: SlotProjection['planning'] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {planning?.pitch && (
        <div className="col-span-full rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Quick Pitch</div>
          <p className="text-ink-soft whitespace-pre-wrap leading-relaxed">{planning.pitch}</p>
        </div>
      )}
      {planning?.genre && (
        <div className="col-span-full rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Genre Statement</div>
          <p className="text-ink-soft whitespace-pre-wrap leading-relaxed">{planning.genre}</p>
        </div>
      )}
      {planning?.gWorld && planning.gWorld.length > 0 && (
        <div className="rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">World Facts</div>
          <ul className="list-disc pl-4 space-y-1 text-ink-soft">
            {planning.gWorld.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}
      {planning?.gFNL && planning.gFNL.length > 0 && (
        <div className="rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Required Entities</div>
          <ul className="list-disc pl-4 space-y-1 text-ink-soft">
            {planning.gFNL.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}
      {planning?.tone && planning.tone.length > 0 && (
        <div className="rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Tone Keywords</div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {planning.tone.map((w, idx) => (
              <span key={idx} className="rounded bg-brass/10 px-2 py-0.5 text-xs text-brass-deep font-display uppercase tracking-wider">{w}</span>
            ))}
          </div>
        </div>
      )}
      {planning?.lines && planning.lines.length > 0 && (
        <div className="rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Content Lines (Hard Nos)</div>
          <ul className="list-disc pl-4 space-y-1 text-ink-soft">
            {planning.lines.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}
      {planning?.facts && planning.facts.length > 0 && (
        <div className="rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Setting Facts</div>
          <ul className="list-disc pl-4 space-y-1 text-ink-soft">
            {planning.facts.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}
      {planning?.secrets && planning.secrets.length > 0 && (
        <div className="rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Secrets & Clues</div>
          <ul className="list-disc pl-4 space-y-1 text-ink-soft">
            {planning.secrets.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}
      {planning?.conflicts && planning.conflicts.length > 0 && (
        <div className="col-span-full rounded border border-rule bg-parchment p-4 shadow-card space-y-2 font-serif text-sm">
          <div className="font-display text-xs uppercase tracking-wider text-brass-deep border-b border-rule pb-1">Active Conflicts</div>
          <ul className="list-disc pl-4 space-y-1 text-ink-soft">
            {planning.conflicts.map((w, idx) => <li key={idx}>{w}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
