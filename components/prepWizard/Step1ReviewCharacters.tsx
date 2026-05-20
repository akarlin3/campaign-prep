'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { SessionLogEntry } from '@/lib/sessionLog';
import { getLastSessionLog, eventsOfKind } from '@/lib/prepWizard';
import StepShell from './StepShell';

type Get = (k: string, fb: any) => any;
type SetVal = (k: string, v: any) => void;

type Goal = {
  text?: string;
  timeframe?: string;
  success?: string;
  failure?: string;
  linked?: string;
  status?: string;
};

const TIMEFRAMES = ['short', 'medium', 'long'];
const STATUSES = ['Active', 'Progressed', 'Completed', 'Failed'];

export default function Step1ReviewCharacters({ get, setVal }: { get: Get; setVal: SetVal }) {
  const logs = (get('sessionLogV2', []) as SessionLogEntry[]) || [];
  const last = getLastSessionLog(logs);

  const goals = (get('pcGoals', []) as Goal[]) || [];
  const notes = ((get('__prepWizardStepNotes', {}) as Record<string, string>)[1]) || '';
  const setNotes = (v: string) => {
    const all = (get('__prepWizardStepNotes', {}) as Record<string, string>) || {};
    setVal('__prepWizardStepNotes', { ...all, 1: v });
  };
  const setGoals = (next: Goal[]) => setVal('pcGoals', next);

  const goalUpdates = last?.goalUpdates || [];
  const pcEvents = eventsOfKind(last, ['goal_status']);

  const hasContext = goalUpdates.length > 0 || pcEvents.length > 0;
  const context = hasContext ? (
    <ul className="space-y-1 text-sm">
      {goalUpdates.map((u, i) => (
        <li key={`gu-${i}`} className="text-ink-soft">
          <span className="text-brass-deep">{u.goal || 'Goal'}</span>
          <span className="text-ink-mute"> · {u.from} → {u.to}</span>
        </li>
      ))}
      {pcEvents
        .filter(e => !goalUpdates.find(u => e.summary.startsWith((u.goal || '') + ':')))
        .map((e, i) => (
          <li key={`ev-${i}`} className="text-ink-soft">{e.summary}</li>
        ))}
    </ul>
  ) : null;

  return (
    <StepShell
      stepNumber={1}
      title="Review the Characters"
      purpose="Reread PC goals, bonds, and recent decisions. Prep should put characters at the center."
      methodology="shea"
      contextFromLastSession={context}
    >
      <div className="space-y-2">
        <h3 className="font-display tracking-wide text-sm text-ink">PC Goals</h3>
        {goals.length === 0 && (
          <p className="text-xs text-ink-mute italic font-serif">No PC goals tracked yet.</p>
        )}
        {goals.map((g, i) => (
          <div key={i} className="rounded border border-rule bg-parchment-soft p-3 space-y-2">
            <div className="flex items-start gap-2">
              <textarea
                value={g.text || ''}
                onChange={(e) => {
                  const next = [...goals];
                  next[i] = { ...g, text: e.target.value };
                  setGoals(next);
                }}
                placeholder="Goal — e.g., Win a duel against the captain of the guard"
                rows={2}
                className="flex-1 bg-parchment border border-rule rounded px-2 py-1 text-sm text-ink font-serif resize-y"
              />
              <button
                onClick={() => setGoals(goals.filter((_, j) => j !== i))}
                className="text-ink-mute hover:text-crimson p-1"
                title="Remove goal"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-serif text-ink-soft">
              <label className="flex items-center gap-1.5">
                <span className="text-brass-deep font-display uppercase tracking-wider text-[10px]">Time</span>
                <select
                  value={g.timeframe || 'short'}
                  onChange={(e) => {
                    const next = [...goals];
                    next[i] = { ...g, timeframe: e.target.value };
                    setGoals(next);
                  }}
                  className="bg-parchment border border-rule rounded px-1.5 py-0.5"
                >
                  {TIMEFRAMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-1.5">
                <span className="text-brass-deep font-display uppercase tracking-wider text-[10px]">Status</span>
                <select
                  value={g.status || 'Active'}
                  onChange={(e) => {
                    const next = [...goals];
                    next[i] = { ...g, status: e.target.value };
                    setGoals(next);
                  }}
                  className="bg-parchment border border-rule rounded px-1.5 py-0.5"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </div>
        ))}
        <button
          onClick={() => setGoals([...goals, { text: '', timeframe: 'short', success: '', failure: '', linked: '', status: 'Active' }])}
          className="text-xs text-brass-deep hover:text-crimson flex items-center gap-1 font-display uppercase tracking-wider"
        >
          <Plus size={12} /> Add Goal
        </button>
      </div>

      <NotesField value={notes} onChange={setNotes} />
    </StepShell>
  );
}

function NotesField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] text-brass-deep font-display uppercase tracking-wider">
        Notes for this session
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder="What about the characters should shape this session?"
        className="w-full bg-parchment border border-rule rounded px-2 py-1.5 text-sm text-ink font-serif resize-y"
      />
    </label>
  );
}
