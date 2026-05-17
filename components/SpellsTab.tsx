'use client';

import { useState, useMemo } from 'react';
import { Search, Star, ChevronDown, ChevronRight } from 'lucide-react';
import spellsData from '@/lib/srd/spells.json';

type Spell = {
  index: string;
  name: string;
  level: number;
  school: string;
  classes: string[];
  ritual: boolean;
  concentration: boolean;
  casting_time: string;
  range: string;
  components: string[];
  material: string | null;
  duration: string;
  desc: string[];
  higher_level: string[];
};

const ALL_SPELLS = spellsData as Spell[];
const SCHOOLS = ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'];
const CLASSES = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];
const LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function toggleInSet<T>(set: Set<T>, val: T): Set<T> {
  const next = new Set(set);
  if (next.has(val)) next.delete(val);
  else next.add(val);
  return next;
}

const Chip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-2 py-0.5 rounded-sm border font-display uppercase tracking-wider transition-colors ${
      active
        ? 'bg-crimson border-crimson text-parchment'
        : 'border-rule text-ink-soft hover:bg-parchment-deep'
    }`}
  >
    {children}
  </button>
);

export default function SpellsTab({
  favorites,
  onFavoritesChange,
}: {
  favorites: string[];
  onFavoritesChange: (next: string[]) => void;
}) {
  const [q, setQ] = useState('');
  const [levels, setLevels] = useState<Set<number>>(new Set());
  const [schools, setSchools] = useState<Set<string>>(new Set());
  const [classes, setClasses] = useState<Set<string>>(new Set());
  const [conc, setConc] = useState(false);
  const [rit, setRit] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ALL_SPELLS.filter((s) => {
      if (favOnly && !favSet.has(s.index)) return false;
      if (needle && !s.name.toLowerCase().includes(needle)) return false;
      if (levels.size && !levels.has(s.level)) return false;
      if (schools.size && !schools.has(s.school)) return false;
      if (classes.size && !s.classes.some((c) => classes.has(c))) return false;
      if (conc && !s.concentration) return false;
      if (rit && !s.ritual) return false;
      return true;
    });
  }, [q, levels, schools, classes, conc, rit, favOnly, favSet]);

  const toggleFav = (idx: string) => {
    onFavoritesChange(favSet.has(idx) ? favorites.filter((f) => f !== idx) : [...favorites, idx]);
  };

  const toggleExpand = (idx: string) => setExpanded((s) => toggleInSet(s, idx));

  const clearAll = () => {
    setQ('');
    setLevels(new Set());
    setSchools(new Set());
    setClasses(new Set());
    setConc(false);
    setRit(false);
    setFavOnly(false);
  };

  const anyFilter = !!(q || levels.size || schools.size || classes.size || conc || rit || favOnly);

  return (
    <div className="space-y-3">
      <div className="rounded border border-rule bg-parchment-soft p-3 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <Search size={14} className="text-ink-mute flex-shrink-0" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Search ${ALL_SPELLS.length} SRD spells…`}
            className="flex-1 bg-parchment border border-rule rounded-sm px-2 py-1.5 text-sm text-ink placeholder-ink-faint font-serif focus:border-brass-deep focus:outline-none"
          />
        </div>

        <FilterRow label="Level">
          {LEVELS.map((l) => (
            <Chip key={l} active={levels.has(l)} onClick={() => setLevels((s) => toggleInSet(s, l))}>
              {l === 0 ? 'Cant' : l}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="School">
          {SCHOOLS.map((s) => (
            <Chip key={s} active={schools.has(s)} onClick={() => setSchools((cur) => toggleInSet(cur, s))}>
              {s.slice(0, 4)}
            </Chip>
          ))}
        </FilterRow>

        <FilterRow label="Class">
          {CLASSES.map((c) => (
            <Chip key={c} active={classes.has(c)} onClick={() => setClasses((cur) => toggleInSet(cur, c))}>
              {c.slice(0, 3)}
            </Chip>
          ))}
        </FilterRow>

        <div className="flex flex-wrap items-center gap-1">
          <Chip active={conc} onClick={() => setConc((v) => !v)}>Concentration</Chip>
          <Chip active={rit} onClick={() => setRit((v) => !v)}>Ritual</Chip>
          <Chip active={favOnly} onClick={() => setFavOnly((v) => !v)}>
            <span className="inline-flex items-center gap-1">
              <Star size={10} fill={favOnly ? 'currentColor' : 'none'} /> Favorites ({favorites.length})
            </span>
          </Chip>
          <div className="flex-1" />
          {anyFilter && (
            <button
              onClick={clearAll}
              className="text-ink-mute hover:text-crimson font-display uppercase tracking-wider px-1"
            >
              Clear
            </button>
          )}
          <span className="text-ink-mute font-display tracking-wider ml-2">
            {filtered.length} / {ALL_SPELLS.length}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {filtered.map((s) => {
          const isFav = favSet.has(s.index);
          const isOpen = expanded.has(s.index);
          return (
            <div
              key={s.index}
              className={`rounded-sm border ${
                isFav ? 'border-brass-deep/60 bg-brass/5' : 'border-rule bg-parchment-soft'
              }`}
            >
              <div className="flex items-center gap-2 px-2 py-1.5">
                <button
                  onClick={() => toggleFav(s.index)}
                  className={isFav ? 'text-brass-deep' : 'text-ink-faint hover:text-brass-deep'}
                  aria-label={isFav ? `Unfavorite ${s.name}` : `Favorite ${s.name}`}
                >
                  <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => toggleExpand(s.index)}
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                >
                  <span className="font-display text-[10px] text-ink-mute w-6 flex-shrink-0 text-center">
                    {s.level === 0 ? 'C' : s.level}
                  </span>
                  <span className="font-display tracking-wide text-sm text-ink flex-1 truncate">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-ink-mute italic font-serif hidden sm:inline">
                    {s.school}
                  </span>
                  {s.concentration && (
                    <span
                      className="text-[10px] text-wine font-display tracking-wider"
                      title="Concentration"
                    >
                      Conc
                    </span>
                  )}
                  {s.ritual && (
                    <span
                      className="text-[10px] text-moss font-display tracking-wider"
                      title="Ritual"
                    >
                      Rit
                    </span>
                  )}
                  {isOpen ? (
                    <ChevronDown size={12} className="text-ink-faint flex-shrink-0" />
                  ) : (
                    <ChevronRight size={12} className="text-ink-faint flex-shrink-0" />
                  )}
                </button>
              </div>
              {isOpen && (
                <div className="px-3 pb-3 pt-2 border-t border-rule/60 space-y-2 text-xs text-ink-soft font-serif">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                    <Meta label="Casting Time">{s.casting_time}</Meta>
                    <Meta label="Range">{s.range}</Meta>
                    <Meta label="Duration">{s.duration}</Meta>
                    <Meta label="Components">
                      {s.components.join(', ')}
                      {s.material ? ` (${s.material})` : ''}
                    </Meta>
                    <div className="sm:col-span-2">
                      <Meta label="Classes">{s.classes.join(', ')}</Meta>
                    </div>
                  </div>
                  {s.desc.map((p, i) => (
                    <p key={i} className="leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {s.higher_level.length > 0 && (
                    <div className="border-l-2 border-brass-deep/40 pl-2">
                      <div className="text-brass-deep font-display tracking-wider uppercase text-[10px] mb-1">
                        At Higher Levels
                      </div>
                      {s.higher_level.map((p, i) => (
                        <p key={i} className="leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center text-xs text-ink-mute italic font-serif py-8">
            No spells match.
          </div>
        )}
      </div>

      <p className="text-[10px] text-ink-mute italic font-serif text-center">
        Spell text from the D&amp;D 5e SRD 5.1 © Wizards of the Coast, CC-BY-4.0.
      </p>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-[10px] text-brass-deep font-display uppercase tracking-wider mr-1 w-14">
        {label}
      </span>
      {children}
    </div>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="text-brass-deep font-display tracking-wider uppercase text-[10px] mr-1">
        {label}:
      </span>
      <span className="text-ink">{children}</span>
    </div>
  );
}
