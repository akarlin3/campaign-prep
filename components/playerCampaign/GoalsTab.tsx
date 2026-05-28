'use client';

// "Goals" tab: the player's redacted PC goals with timeframe/status badges.
// Extracted verbatim from PlayerCampaignView.

import React from 'react';
import type { SlotProjection } from '@/lib/playerMode/types';

const TIMEFRAME_LABELS: Record<string, string> = {
  short: 'Short-Term',
  mid: 'Mid-Term',
  long: 'Long-Term',
};

const TIMEFRAME_BADGE_STYLES: Record<string, string> = {
  short: 'bg-brass/10 border-brass/35 text-brass-deep',
  mid: 'bg-wine/10 border-wine/35 text-wine',
  long: 'bg-parchment-deep border-rule text-ink-soft',
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  Active: 'bg-brass/10 border-brass/35 text-brass-deep',
  Progressed: 'bg-wine/15 border-wine/40 text-wine font-semibold',
  Completed: 'bg-moss/10 border-moss/30 text-moss font-semibold',
  Failed: 'bg-crimson/10 border-crimson/30 text-crimson font-semibold',
};

export default function GoalsTab({ pcGoals }: { pcGoals: SlotProjection['pcGoals'] }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2">
      {pcGoals?.map((g, idx) => {
        const timeframe = g.timeframe || 'short';
        const timeframeLabel = TIMEFRAME_LABELS[timeframe] || 'Short-Term';
        const timeframeStyle = TIMEFRAME_BADGE_STYLES[timeframe] || TIMEFRAME_BADGE_STYLES.short;

        const status = g.status || 'Active';
        const statusStyle = STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.Active;

        return (
          <div key={idx} className="rounded border border-rule bg-parchment p-4 shadow-card space-y-3 font-serif text-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded border font-display uppercase tracking-wider ${timeframeStyle}`}>
                  {timeframeLabel}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-display uppercase tracking-wider ${statusStyle}`}>
                  {status}
                </span>
              </div>
              <p className="text-ink font-serif text-base leading-snug font-medium tracking-wide">
                {g.text}
              </p>
            </div>
            <div className="space-y-2 pt-1">
              {g.success && (
                <div className="space-y-0.5 pt-1.5 border-t border-rule/50">
                  <div className="text-[10px] font-display uppercase tracking-wider text-brass-deep">Success State</div>
                  <p className="text-ink-soft font-serif text-xs leading-relaxed italic">{g.success}</p>
                </div>
              )}
              {g.failure && (
                <div className="space-y-0.5 pt-1.5 border-t border-rule/50">
                  <div className="text-[10px] font-display uppercase tracking-wider text-crimson">Failure Consequence</div>
                  <p className="text-ink-soft font-serif text-xs leading-relaxed italic">{g.failure}</p>
                </div>
              )}
              {g.linked && (
                <div className="space-y-0.5 pt-1.5 border-t border-rule/50">
                  <div className="text-[10px] font-display uppercase tracking-wider text-ink-mute">Linked Elements</div>
                  <p className="text-ink-soft font-serif text-xs leading-relaxed">{g.linked}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
