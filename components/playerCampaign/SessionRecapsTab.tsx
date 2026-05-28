'use client';

// "Sessions" tab: collapsible session recap cards. Extracted verbatim from
// PlayerCampaignView.

import React from 'react';
import { ChevronDown, ChevronRight, Award, Zap } from 'lucide-react';
import type { ChangeEvent, ChangeEventKind } from '@/lib/sessionEvents';
import { CHANGE_EVENT_LABELS } from '@/lib/sessionEvents';
import type { SessionRecap } from './types';

export default function SessionRecapsTab({
  sessionRecaps,
  openSessionIds,
  onToggleSession,
}: {
  sessionRecaps?: SessionRecap[];
  openSessionIds: Record<string, boolean>;
  onToggleSession: (id: string) => void;
}) {
  if (!sessionRecaps || sessionRecaps.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-rule bg-parchment p-8 text-center shadow-card font-serif italic text-ink-soft bg-parchment-soft">
          No sessions have been logged yet.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessionRecaps.map((log, i) => (
        <div key={log.id || i} className="rounded border border-rule bg-parchment shadow-card">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-parchment-soft rounded-t">
            <button
              type="button"
              onClick={() => onToggleSession(log.id)}
              className="flex-shrink-0 text-ink-mute hover:text-ink focus:outline-none"
            >
              {openSessionIds[log.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <button
              type="button"
              onClick={() => onToggleSession(log.id)}
              className="min-w-0 flex-1 text-left focus:outline-none"
            >
              <div className="truncate font-display tracking-wide text-ink font-semibold">
                {log.title || 'Untitled Session'}
              </div>
              <div className="font-serif text-[11px] text-ink-mute">
                {log.date} {log.events && log.events.length > 0 ? `· ${log.events.length} events` : ''} {log.xpAwarded ? `· ${log.xpAwarded} XP` : ''}
              </div>
            </button>
          </div>

          {/* Collapsible Content */}
          {openSessionIds[log.id] && (
            <div className="space-y-4 p-4 border-t border-rule bg-parchment-soft/10">
              {/* Recap Body */}
              <div className="space-y-1">
                <div className="font-display text-[10px] uppercase tracking-wider text-brass-deep font-semibold">Recap</div>
                {log.body && log.body.trim() ? (
                  <p className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-ink-soft">{log.body}</p>
                ) : (
                  <p className="font-serif text-xs italic text-ink-mute">No recap written.</p>
                )}
              </div>

              {/* Strong Start */}
              {log.strongStart && (
                <div className="rounded border border-crimson/30 bg-crimson/5 p-3 flex items-start gap-2.5 shadow-sm max-w-2xl">
                  <Zap size={14} className="text-crimson mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-display text-[10px] uppercase tracking-wider text-crimson block font-semibold">Strong Start Delivered</span>
                    <p className="mt-0.5 text-sm font-serif text-ink-soft whitespace-pre-wrap italic">
                      "{log.strongStart}"
                    </p>
                  </div>
                </div>
              )}

              {/* XP Awarded */}
              {log.xpAwarded && (
                <div className="flex items-center gap-1 font-display text-xs uppercase tracking-wider text-brass-deep font-semibold">
                  <Award size={13} className="text-brass-deep" /> {log.xpAwarded.toLocaleString()} XP Awarded
                </div>
              )}

              {/* Grouped Events */}
              {log.events && log.events.length > 0 && (
                <div className="space-y-2">
                  <div className="font-display text-[10px] uppercase tracking-wider text-brass-deep font-semibold">Captured Events</div>
                  <div className="space-y-1.5 pl-2 border-l border-rule">
                    {(() => {
                      const eventsByKind: Record<ChangeEventKind, ChangeEvent[]> = {} as Record<ChangeEventKind, ChangeEvent[]>;
                      log.events!.forEach((e: ChangeEvent) => {
                        if (e && e.kind) {
                          (eventsByKind[e.kind] ||= []).push(e);
                        }
                      });
                      return (Object.entries(eventsByKind) as [ChangeEventKind, ChangeEvent[]][]).map(([kind, list]) => (
                        <div key={kind} className="rounded border border-rule/40 bg-parchment-soft p-2 max-w-xl">
                          <div className="mb-0.5 font-display text-[9px] uppercase tracking-wider text-brass-deep font-semibold">
                            {CHANGE_EVENT_LABELS[kind] || kind}
                          </div>
                          <ul className="space-y-0.5 list-disc pl-3">
                            {list.map((e) => (
                              <li key={e.id} className="font-serif text-[11px] text-ink-soft leading-normal">
                                <span>{e.summary}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* Secrets Revealed */}
              {log.secretsRevealed && log.secretsRevealed.length > 0 && (
                <div className="space-y-1">
                  <div className="font-display text-[10px] uppercase tracking-wider text-brass-deep font-semibold">Secrets & Clues Revealed</div>
                  <ul className="list-disc pl-4 space-y-0.5 font-serif text-[11px] text-ink-soft">
                    {log.secretsRevealed.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Scenes Used */}
              {log.scenesUsed && log.scenesUsed.length > 0 && (
                <div className="space-y-1">
                  <div className="font-display text-[10px] uppercase tracking-wider text-brass-deep font-semibold">Scenes Played</div>
                  <ul className="list-disc pl-4 space-y-0.5 font-serif text-[11px] text-ink-soft">
                    {log.scenesUsed.map((s, idx) => <li key={idx}>{s}</li>)}
                  </ul>
                </div>
              )}

              {/* Goal Updates */}
              {log.goalUpdates && log.goalUpdates.length > 0 && (
                <div className="space-y-1">
                  <div className="font-display text-[10px] uppercase tracking-wider text-brass-deep font-semibold">Goal Status Changes</div>
                  <ul className="list-disc pl-4 space-y-0.5 font-serif text-[11px] text-ink-soft">
                    {log.goalUpdates.map((g, idx) => (
                      <li key={idx}>
                        {g.goal}: <span className="text-ink-mute">{g.from} → {g.to}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
