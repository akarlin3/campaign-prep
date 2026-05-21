'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertOctagon } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && options && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-parchment border border-rule rounded shadow-page p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-full shrink-0 ${options.isDestructive ? 'bg-crimson/10 text-crimson' : 'bg-brass/10 text-brass-deep'}`}>
                <AlertOctagon size={24} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="font-display text-lg text-ink tracking-wide truncate">
                  {options.title}
                </h3>
                <p className="text-sm font-serif text-ink-soft italic leading-relaxed break-words">
                  {options.message}
                </p>
              </div>
            </div>
            <div className="flourish"><span>❦</span></div>
            <div className="flex justify-end gap-3 font-display text-xs tracking-wider uppercase">
              <button
                onClick={() => handleClose(false)}
                className="px-4 py-2 rounded border border-brass text-brass-deep hover:bg-brass/10 transition-colors"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`px-4 py-2 rounded text-parchment transition-colors ${
                  options.isDestructive
                    ? 'bg-crimson hover:bg-wine'
                    : 'bg-brass-deep hover:bg-brass-deep/90'
                }`}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context.confirm;
}
