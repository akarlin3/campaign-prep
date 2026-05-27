'use client';

import { useEffect, useState } from 'react';
import { X, Sparkles, User, Users, Info } from 'lucide-react';

type Props = {
  open: boolean;
  currentMode: 'solo' | 'duet' | 'standard';
  onClose: () => void;
  onSave: (mode: 'solo' | 'duet' | 'standard') => void;
};

export default function ModeSwitcherModal({ open, currentMode, onClose, onSave }: Props) {
  const [selectedMode, setSelectedMode] = useState<'solo' | 'duet' | 'standard'>(currentMode);

  useEffect(() => {
    if (open) {
      setSelectedMode(currentMode);
    }
  }, [open, currentMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    onSave(selectedMode);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Campaign play mode settings"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-rule bg-parchment shadow-page"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rule px-4 py-3">
          <div>
            <h2 className="font-display text-lg tracking-wide text-ink">Campaign Play Mode</h2>
            <p className="mt-0.5 font-serif text-[11px] italic text-ink-mute">
              Configure target scales and active tools for this session.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="text-ink-mute hover:text-crimson transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="rounded border border-brass-deep/20 bg-brass/5 p-3 flex gap-2.5 items-start text-xs text-brass-deep leading-relaxed">
            <Info size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              Changing the campaign's play mode adjusts the visual layout, prep target scales, and active tools (such as Player Mode or the Wells Oracle). <strong>No data will be deleted or altered</strong> in your database.
            </p>
          </div>

          <div className="space-y-3">
            {/* Solo Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('solo')}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                selectedMode === 'solo'
                  ? 'border-pink-500 bg-pink-950/5 text-ink'
                  : 'border-rule hover:border-pink-500/50 bg-transparent text-ink-soft'
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  selectedMode === 'solo' ? 'bg-pink-500/15 text-pink-500' : 'bg-parchment-deep text-ink-soft'
                }`}
              >
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold tracking-wide">Solo Mode</span>
                  {selectedMode === 'solo' && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-pink-500/15 text-pink-500 border border-pink-500/30 rounded font-semibold uppercase font-display tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-mute mt-0.5 leading-relaxed font-serif">
                  Zero players (GM-less). Driven entirely by oracle dice rolls and local scene generation. Pink visual accents.
                </p>
              </div>
            </button>

            {/* Duet Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('duet')}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                selectedMode === 'duet'
                  ? 'border-teal-500 bg-teal-950/5 text-ink'
                  : 'border-rule hover:border-teal-500/50 bg-transparent text-ink-soft'
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  selectedMode === 'duet' ? 'bg-teal-500/15 text-teal-500' : 'bg-parchment-deep text-ink-soft'
                }`}
              >
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold tracking-wide">Duet Mode</span>
                  {selectedMode === 'duet' && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-teal-500/15 text-teal-500 border border-teal-500/30 rounded font-semibold uppercase font-display tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-mute mt-0.5 leading-relaxed font-serif">
                  1 GM + exactly 1 player. Streamlined prep requirements and real-time player character write-backs. Teal visual accents.
                </p>
              </div>
            </button>

            {/* Standard Card */}
            <button
              type="button"
              onClick={() => setSelectedMode('standard')}
              className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                selectedMode === 'standard'
                  ? 'border-amber-500 bg-amber-950/5 text-ink'
                  : 'border-rule hover:border-amber-500/50 bg-transparent text-ink-soft'
              }`}
            >
              <div
                className={`p-2 rounded-md ${
                  selectedMode === 'standard' ? 'bg-amber-500/15 text-amber-500' : 'bg-parchment-deep text-ink-soft'
                }`}
              >
                <Users size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-semibold tracking-wide">Standard Mode</span>
                  {selectedMode === 'standard' && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/15 text-amber-500 border border-amber-500/30 rounded font-semibold uppercase font-display tracking-wider">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-ink-mute mt-0.5 leading-relaxed font-serif">
                  1 GM + multiple players. Traditional group campaign play, comprehensive checklists, and multi-PC management. Amber visual accents.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-rule bg-parchment-deep px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-rule px-3 py-1.5 text-xs font-display uppercase tracking-wider text-ink hover:bg-parchment transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded bg-brass-deep hover:bg-crimson text-parchment px-4 py-1.5 text-xs font-display uppercase tracking-wider transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
