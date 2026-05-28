import {
  isWriteTool,
  type AssistantConversation,
  type ToolCallRecord,
} from '@/lib/assistant/types';
import type { ProposalDecision } from './types';

/** Split a message's tool calls into executed reads and write proposals. */
export function splitToolCalls(toolCalls: ToolCallRecord[] | undefined): {
  reads: ToolCallRecord[];
  writes: ToolCallRecord[];
} {
  const all = toolCalls ?? [];
  return {
    reads: all.filter((t) => !isWriteTool(t.name)),
    writes: all.filter((t) => isWriteTool(t.name)),
  };
}

/**
 * Apply a user's decision for `toolId` to the matching tool call in a
 * conversation's most-recent assistant message. Pure: returns a new
 * conversation list with the call's status/input/output updated, leaving the
 * underlying campaign mutation to the caller.
 */
export function applyProposalDecision(
  conversations: AssistantConversation[],
  convId: string,
  toolId: string,
  decision: ProposalDecision,
  summaryOut: string | undefined,
): AssistantConversation[] {
  return conversations.map((c) => {
    if (c.id !== convId) return c;
    const messages = [...c.messages];
    const lastIdx = messages.length - 1;
    const last = messages[lastIdx];
    if (!last?.toolCalls) return c;
    const toolCalls = last.toolCalls.map((t) =>
      t.id === toolId
        ? {
            ...t,
            input: decision.input ?? t.input,
            status: decision.status === 'approved' ? ('executed' as const) : ('rejected' as const),
            output: summaryOut,
            rejectionReason: decision.rejectionReason,
          }
        : t,
    );
    messages[lastIdx] = { ...last, toolCalls };
    return { ...c, messages };
  });
}

/**
 * Given a fully-resolved assistant message, build the tool_results payload to
 * send back to the model. Returns `null` when the message has no write calls
 * or any write is still pending.
 */
export function collectWriteResults(
  message: { toolCalls?: ToolCallRecord[] } | undefined,
): Array<{ toolUseId: string; ok: boolean; output?: unknown; rejectionReason?: string }> | null {
  if (!message?.toolCalls) return null;
  const writes = message.toolCalls.filter((t) => isWriteTool(t.name));
  if (writes.length === 0) return null;
  if (writes.some((t) => t.status === 'pending')) return null;
  return writes.map((t) => ({
    toolUseId: t.id,
    ok: t.status === 'executed',
    output: t.output,
    rejectionReason: t.rejectionReason,
  }));
}
