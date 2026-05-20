'use client';

import { Plus, Trash2 } from 'lucide-react';

type Props = {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  rows?: number;
  addLabel?: string;
};

export default function StringListEditor({
  items, onChange, placeholder, rows = 1, addLabel = 'Add',
}: Props) {
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const add = () => onChange([...items, '']);

  return (
    <div className="space-y-1.5">
      {items.length === 0 && (
        <p className="text-xs text-ink-mute italic font-serif">Nothing yet.</p>
      )}
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-2">
          <textarea
            value={it}
            onChange={(e) => update(i, e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="flex-1 bg-parchment border border-rule rounded px-2 py-1 text-sm text-ink font-serif resize-y"
          />
          <button
            onClick={() => remove(i)}
            className="text-ink-mute hover:text-crimson p-1 mt-0.5"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={add}
        className="text-xs text-brass-deep hover:text-crimson flex items-center gap-1 font-display uppercase tracking-wider"
      >
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}
