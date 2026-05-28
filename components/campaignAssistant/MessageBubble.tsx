'use client';

import { Bot, Search } from 'lucide-react';
import type { AssistantMessage } from '@/lib/assistant/types';
import { ProposalCard } from './ProposalCard';
import { splitToolCalls } from './proposals';
import type { LooseRecord } from './types';

export function MessageBubble({
  message,
  complete,
  onApprove,
  onReject,
  disabled,
}: {
  message: AssistantMessage;
  complete: boolean;
  onApprove: (toolId: string, input: LooseRecord) => void;
  onReject: (toolId: string, reason: string) => void;
  disabled: boolean;
}) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-lg border border-amber-300/50 bg-amber-100/40 px-3 py-2 text-sm text-ink">
          {message.content}
        </div>
      </div>
    );
  }

  const { reads, writes } = splitToolCalls(message.toolCalls);

  return (
    <div
      className="flex items-start gap-2"
      data-assistant-response
      data-status={complete ? 'complete' : 'streaming'}
    >
      <Bot size={15} className="mt-0.5 shrink-0 text-wine" />
      <div className="min-w-0 flex-1 space-y-2">
        {reads.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {reads.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full bg-parchment-deep/60 px-2 py-0.5 text-[10px] text-ink-mute"
                title={JSON.stringify(t.input)}
              >
                <Search size={9} /> {t.name}
              </span>
            ))}
          </div>
        )}
        {message.content && (
          <div className="whitespace-pre-wrap text-sm text-ink-soft">{message.content}</div>
        )}
        {writes.map((t) => (
          <ProposalCard
            key={t.id}
            call={t}
            onApprove={onApprove}
            onReject={onReject}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
