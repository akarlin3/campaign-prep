'use client';

import { useState } from 'react';
import { AlertTriangle, ArrowDownToLine, Flame, Building2, Cone } from 'lucide-react';
import {
  fallingDamage5e,
  fallingObjectDamage,
  blastRadiusFt,
  blastOcclusion,
  MATERIALS,
  structuralFailure,
  type Material,
} from '@/lib/hazards';

type Tab = 'falling' | 'object' | 'blast' | 'structure';

export default function HazardCalculator() {
  const [tab, setTab] = useState<Tab>('falling');
  return (
    <div className="space-y-4 text-sm">
      <header className="space-y-1">
        <h2 className="font-display text-lg uppercase tracking-wide text-ink">Hazards</h2>
        <p className="font-serif text-xs italic text-ink-mute">
          Physics-grounded rulings for falls, falling objects, blasts, and structural collapses.
          Use the suggested dice as a starting point; the table is still the final arbiter.
        </p>
      </header>

      <nav className="flex flex-wrap gap-1.5">
        {([
          { id: 'falling',   label: 'Falling',     icon: ArrowDownToLine },
          { id: 'object',    label: 'Falling Obj', icon: AlertTriangle },
          { id: 'blast',     label: 'Blast',       icon: Flame },
          { id: 'structure', label: 'Structure',   icon: Building2 },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-display text-xs uppercase tracking-wider transition-colors ${
              tab === t.id
                ? 'border-crimson bg-crimson text-parchment'
                : 'border-rule bg-parchment-soft text-ink-soft hover:border-brass'
            }`}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </nav>

      <div className="rounded border border-rule bg-parchment p-4 shadow-card">
        {tab === 'falling' && <FallingPanel />}
        {tab === 'object' && <FallingObjectPanel />}
        {tab === 'blast' && <BlastPanel />}
        {tab === 'structure' && <StructurePanel />}
      </div>
    </div>
  );
}

function NumberInput({
  label, value, onChange, unit, step = 1, min = 0,
}: {
  label: string; value: number; onChange: (n: number) => void;
  unit?: string; step?: number; min?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-display text-xs uppercase tracking-wider text-brass-deep">{label}</span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          step={step}
          min={min}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full rounded border border-rule bg-parchment-soft px-2 py-1 font-serif text-sm text-ink focus:border-crimson focus:outline-none"
        />
        {unit && <span className="font-serif text-xs text-ink-mute">{unit}</span>}
      </div>
    </label>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded border border-rule bg-parchment-soft p-2.5">
      <div className="font-display text-[10px] uppercase tracking-wider text-brass-deep">{label}</div>
      <div className="font-display text-lg text-ink">{value}</div>
      {hint && <div className="font-serif text-xs italic text-ink-mute">{hint}</div>}
    </div>
  );
}

function FallingPanel() {
  const [ft, setFt] = useState(30);
  const r = fallingDamage5e(ft);
  return (
    <div className="space-y-3">
      <NumberInput label="Fall distance" value={ft} onChange={setFt} unit="ft" step={5} />
      <div className="grid grid-cols-2 gap-2">
        <Stat
          label="5e damage"
          value={`${r.dice}d6`}
          hint={r.capped ? 'Capped at 20d6 (200+ ft)' : '1d6 per 10 ft'}
        />
        <Stat label="Avg damage" value={`${r.averageDamage}`} hint="bludgeoning" />
      </div>
    </div>
  );
}

function FallingObjectPanel() {
  const [weight, setWeight] = useState(50);
  const [fall, setFall] = useState(20);
  const r = fallingObjectDamage({ weightLb: weight, fallFt: fall });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Object weight" value={weight} onChange={setWeight} unit="lb" step={5} />
        <NumberInput label="Fall height" value={fall} onChange={setFall} unit="ft" step={5} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Velocity" value={`${r.velocityMs.toFixed(1)} m/s`} hint="at impact" />
        <Stat label="Energy" value={`${(r.energyJ / 1000).toFixed(2)} kJ`} hint="kinetic" />
        <Stat label="Suggested" value={r.suggestedDice} hint="bludgeoning" />
      </div>
      <p className="font-serif text-xs italic text-ink-mute">{r.reasoning}</p>
    </div>
  );
}

function BlastPanel() {
  const [tnt, setTnt] = useState(1);
  const [coverPct, setCoverPct] = useState(0);
  const lethal = blastRadiusFt(tnt, 'lethal');
  const injurious = blastRadiusFt(tnt, 'injurious');
  const window = blastRadiusFt(tnt, 'window');
  const occ = blastOcclusion(coverPct / 100);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="TNT-equivalent" value={tnt} onChange={setTnt} unit="kg" step={0.5} />
        <NumberInput label="Cover fraction" value={coverPct} onChange={setCoverPct} unit="%" step={5} min={0} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Lethal" value={`${lethal.toFixed(0)} ft`} hint="severe burns / shrapnel" />
        <Stat label="Injurious" value={`${injurious.toFixed(0)} ft`} hint="moderate damage" />
        <Stat label="Window-break" value={`${window.toFixed(0)} ft`} hint="distant shockwave" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Stat
          label="Damage × cover"
          value={`${(occ.damageMultiplier * 100).toFixed(0)}%`}
          hint={`Nearest 5e bucket: ${occ.bucket} cover`}
        />
        <Stat
          label="Reference"
          value={`Fireball ≈ 20 ft`}
          hint="for sanity-check"
        />
      </div>
    </div>
  );
}

function StructurePanel() {
  const [matId, setMatId] = useState<Material['id']>('stone');
  const [load, setLoad] = useState(2000);
  const [area, setArea] = useState(0.05);
  const mat = MATERIALS.find(m => m.id === matId) ?? MATERIALS[0];
  const r = structuralFailure({ loadKg: load, areaM2: area, material: mat });
  return (
    <div className="space-y-3">
      <label className="flex flex-col gap-1">
        <span className="font-display text-xs uppercase tracking-wider text-brass-deep">Material</span>
        <select
          value={matId}
          onChange={(e) => setMatId(e.target.value)}
          className="rounded border border-rule bg-parchment-soft px-2 py-1 font-serif text-sm text-ink focus:border-crimson focus:outline-none"
        >
          {MATERIALS.map(m => (
            <option key={m.id} value={m.id}>{m.label} — {m.hpPer5ftCube} HP / 5 ft cube</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <NumberInput label="Load" value={load} onChange={setLoad} unit="kg" step={100} />
        <NumberInput label="Cross-section" value={area} onChange={setArea} unit="m²" step={0.01} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Stress" value={`${r.stressMpa.toFixed(2)} MPa`} />
        <Stat label="Safety margin" value={`${r.safetyMargin.toFixed(2)}×`} />
        <Stat
          label="Status"
          value={r.failing ? 'FAILING' : 'Holds'}
          hint={r.failing ? 'collapse imminent' : `${mat.label} AC ${mat.ac}, ${mat.hpPer5ftCube} HP per 5-ft cube`}
        />
      </div>
      {r.failing && (
        <div className="rounded border border-crimson/40 bg-crimson/10 p-2.5 font-serif text-xs text-crimson-deep">
          <span className="font-display uppercase tracking-wider">Collapse:</span> ceiling/floor section
          gives way. Suggest Dex save (DC 13–18, scale with severity) or take{' '}
          {Math.min(20, Math.round(load / 100))}d6 bludgeoning + restrained.
        </div>
      )}
    </div>
  );
}
