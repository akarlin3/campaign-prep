'use client';

import { useCallback, useMemo, useState, useEffect } from 'react';
import { Coins, Gem, Shirt, Sparkles, Beer, MountainSnow, MapPinned, Map, ScrollText, Wand2 } from 'lucide-react';
import { applyGeneratorResultToData, recordHistoryOnly } from '@/lib/generators/save';
import type { GenerationHistoryEntry, GeneratorKind, GeneratorResult } from '@/lib/generators/types';
import TreasureHoardGenerator from './TreasureHoardGenerator';
import TrinketGenerator from './TrinketGenerator';
import MundaneShopGenerator from './MundaneShopGenerator';
import MagicShopGenerator from './MagicShopGenerator';
import TavernGenerator from './TavernGenerator';
import DungeonGenerator from './DungeonGenerator';
import SettlementGenerator from './SettlementGenerator';
import RecentGenerations from './RecentGenerations';

type GenSlug = GeneratorKind | 'names' | 'locations';

const GROUPS: { label: string; entries: { slug: GenSlug; label: string; icon: typeof Coins; gated?: boolean }[] }[] = [
  {
    label: 'Treasure',
    entries: [
      { slug: 'treasure-hoard', label: 'Treasure Hoards', icon: Coins },
      { slug: 'trinket', label: 'Trinkets', icon: Gem },
      { slug: 'mundane-shop', label: 'Mundane Shops', icon: Shirt },
      { slug: 'magic-shop', label: 'Magic Item Shops', icon: Wand2 },
    ],
  },
  {
    label: 'World',
    entries: [
      { slug: 'tavern', label: 'Taverns', icon: Beer },
      { slug: 'dungeon', label: 'Dungeons', icon: MountainSnow },
      { slug: 'settlement', label: 'Settlements', icon: MapPinned },
    ],
  },
  {
    label: 'People & Places (existing)',
    entries: [
      { slug: 'names', label: 'Names', icon: ScrollText, gated: true },
      { slug: 'locations', label: 'Locations', icon: Map, gated: true },
    ],
  },
];

export default function GeneratorsTab({
  data,
  onDataChange,
  renderNames,
  renderLocations,
}: {
  data: Record<string, unknown>;
  onDataChange: (next: Record<string, unknown>) => void;
  renderNames: () => React.ReactNode;
  renderLocations: () => React.ReactNode;
}) {
  const [active, setActive] = useState<GenSlug>('treasure-hoard');
  const [savedToast, setSavedToast] = useState<string>('');

  const saveResult = useCallback(async (result: GeneratorResult) => {
    const { data: next, saved } = applyGeneratorResultToData(data, result);
    onDataChange(next);
    setSavedToast(`Saved · ${saved.refs.length} entit${saved.refs.length === 1 ? 'y' : 'ies'} created`);
    setTimeout(() => setSavedToast(''), 1800);
  }, [data, onDataChange]);

  // Keyboard shortcuts. R / S / E only act when a result is on screen — handled
  // via window events that the GeneratorPanel could dispatch, but simpler: we
  // attach a small `data-generator-action` convention and synthesize a click
  // on the matching button. Falls back gracefully if no button is present.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      const button = (selector: string) => document.querySelector<HTMLButtonElement>(selector);
      if (key === 'g') {
        document.querySelector<HTMLElement>('[data-generators-sidebar]')?.focus();
      } else if (key === 'r') {
        // Reroll: click "Reroll" button if visible, else the main Generate button.
        const b = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(btn => /Reroll|Generate/.test(btn.textContent ?? ''));
        b?.click();
      } else if (key === 's') {
        const b = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(btn => /Save to campaign|Saved/.test(btn.textContent ?? '') && !btn.disabled);
        b?.click();
      } else if (key === 'e') {
        const b = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(btn => /Enhance with AI|Enhancing/.test(btn.textContent ?? ''));
        b?.click();
      }
      void button;
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const rerollFromHistory = useCallback((entry: GenerationHistoryEntry) => {
    setActive(entry.kind);
    // Best effort: switching the tab causes the panel to remount with default
    // inputs; the user can press R to reroll with a new seed. Promoting the
    // exact same seed would require lifting state into GeneratorsTab, which
    // is deferred.
  }, []);

  const inspectFromHistory = useCallback((entry: GenerationHistoryEntry) => {
    // Re-record the result (no entities saved) so the user can scroll back to
    // see it; otherwise no-op — the entry is already in the list.
    const { data: next } = recordHistoryOnly(data, entry.result);
    onDataChange(next);
  }, [data, onDataChange]);

  const history = useMemo(() => (Array.isArray(data.generationsHistory) ? (data.generationsHistory as GenerationHistoryEntry[]) : []), [data]);

  const ActiveComponent = useMemo(() => {
    switch (active) {
      case 'treasure-hoard': return <TreasureHoardGenerator onSave={saveResult} />;
      case 'trinket': return <TrinketGenerator onSave={saveResult} />;
      case 'mundane-shop': return <MundaneShopGenerator onSave={saveResult} />;
      case 'magic-shop': return <MagicShopGenerator onSave={saveResult} />;
      case 'tavern': return <TavernGenerator onSave={saveResult} />;
      case 'dungeon': return <DungeonGenerator onSave={saveResult} />;
      case 'settlement': return <SettlementGenerator onSave={saveResult} />;
      case 'names': return renderNames();
      case 'locations': return renderLocations();
      default: return null;
    }
  }, [active, saveResult, renderNames, renderLocations]);

  return (
    <div className="space-y-3">
      <div className="rounded border border-rule bg-parchment p-3 shadow-card flex items-center gap-2 flex-wrap">
        <Sparkles size={14} className="text-crimson" />
        <h3 className="font-display tracking-wide text-ink">Generators</h3>
        <span className="text-[10px] text-ink-mute italic ml-1">G focuses · R reroll · S save · E enhance (Pro)</span>
        {savedToast && (
          <span className="ml-auto text-[11px] px-2 py-0.5 rounded-sm bg-brass/15 text-brass-deep font-display uppercase tracking-wider">{savedToast}</span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[180px_minmax(0,1fr)] gap-3">
        <aside data-generators-sidebar tabIndex={-1} className="rounded border border-rule bg-parchment p-2 shadow-card outline-none">
          {GROUPS.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <div className="text-[10px] uppercase tracking-wider text-brass-deep font-display px-2 py-1">{group.label}</div>
              <div className="flex flex-col">
                {group.entries.map((entry) => {
                  const Icon = entry.icon;
                  return (
                    <button
                      key={entry.slug}
                      onClick={() => setActive(entry.slug)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm font-serif transition-colors ${active === entry.slug ? 'bg-crimson text-parchment' : 'text-ink hover:bg-parchment-deep'}`}
                    >
                      <Icon size={14} /> {entry.label}
                      {entry.gated && <span className="ml-auto text-[9px] uppercase tracking-wider opacity-70">Pro</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        <div className="space-y-3 min-w-0">
          {ActiveComponent}
          <RecentGenerations entries={history} onReroll={rerollFromHistory} onInspect={inspectFromHistory} />
        </div>
      </div>
    </div>
  );
}
