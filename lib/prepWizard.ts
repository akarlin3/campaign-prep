// Pre-Session Prep Wizard helpers — pulls "from last session" context out of
// the rich Phase 3 session log entries (sessionLogV2) to feed each wizard
// step's contextual callout.

import type { ChangeEvent, ChangeEventKind } from './sessionEvents';
import type { SessionLogEntry } from './sessionLog';

export type PrepWizardRun = {
  id: string;
  forSessionNumber: number;
  completedAt: number;
  stepNotes: Record<number, string>;
  stepsCompleted: number[];
  prepSnapshot: {
    pcGoals: number;
    scenes: number;
    unrevealedSecrets: number;
    locations: number;
    npcs: number;
    monsters: number;
    magicItems: number;
  };
};

export function getLastSessionLog(logs: SessionLogEntry[] | undefined | null): SessionLogEntry | null {
  if (!logs || logs.length === 0) return null;
  return [...logs].sort((a, b) => b.endedAt - a.endedAt)[0];
}

export function eventsOfKind(log: SessionLogEntry | null, kinds: ChangeEventKind[]): ChangeEvent[] {
  if (!log) return [];
  const set = new Set(kinds);
  return log.events.filter(e => set.has(e.kind) && !e.dismissed);
}

export function unrevealedSecrets(allSecrets: string[], allLogs: SessionLogEntry[]): string[] {
  const revealed = new Set<string>();
  for (const l of allLogs) {
    for (const s of l.secretsRevealed || []) revealed.add(s);
  }
  return allSecrets.filter(s => !revealed.has(s));
}

export function recentlyUsedScenes(allLogs: SessionLogEntry[], n = 3): string[] {
  const recent = [...allLogs].sort((a, b) => b.endedAt - a.endedAt).slice(0, n);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const l of recent) {
    for (const s of l.scenesUsed || []) {
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
  }
  return out;
}

export function carryForwardScenes(allScenes: string[], lastLog: SessionLogEntry | null): string[] {
  if (!lastLog) return [];
  const used = new Set(lastLog.scenesUsed || []);
  return allScenes.filter(s => !used.has(s));
}

export function makePrepWizardRunId(): string {
  return `prep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
