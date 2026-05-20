'use client';

import type { ReactNode } from 'react';

const METHOD = {
  shea: { label: 'Lazy DM', color: 'border-moss/40 bg-moss/5 text-moss' },
  ccd:  { label: 'CCD',     color: 'border-brass/40 bg-brass/5 text-brass-deep' },
  pr:   { label: 'Proactive', color: 'border-wine/40 bg-wine/5 text-wine' },
} as const;

type Props = {
  stepNumber: number;
  title: string;
  purpose: string;
  methodology: keyof typeof METHOD;
  contextFromLastSession?: ReactNode;
  children: ReactNode;
};

export default function StepShell({
  stepNumber, title, purpose, methodology, contextFromLastSession, children,
}: Props) {
  const m = METHOD[methodology];
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-display uppercase tracking-wider ${m.color}`}>
            {m.label}
          </span>
          <span className="text-[11px] text-brass-deep font-display uppercase tracking-wider">
            Step {stepNumber} of 8
          </span>
        </div>
        <h2 className="font-display text-2xl tracking-wide text-ink">{title}</h2>
        <p className="text-sm font-serif italic text-ink-soft leading-relaxed">{purpose}</p>
      </header>

      {contextFromLastSession && (
        <div className="rounded border border-brass-deep/40 bg-brass/5 p-3 space-y-1.5">
          <div className="text-[10px] text-brass-deep font-display uppercase tracking-wider">
            From Last Session
          </div>
          <div className="text-sm font-serif text-ink-soft">
            {contextFromLastSession}
          </div>
        </div>
      )}

      <div className="space-y-3">{children}</div>
    </section>
  );
}
