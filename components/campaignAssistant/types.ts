/** Open-ended campaign `data` blob; the assistant only reads/writes known keys. */
export type LooseRecord = Record<string, unknown>;

export type Props = {
  data: LooseRecord;
  campaignName: string;
  setData: (next: LooseRecord) => void;
};

/** A pending write-tool proposal as returned by the turn endpoint. */
export type ServerProposal = { id: string; name: string; input: LooseRecord };

/** An already-executed read-tool call as returned by the turn endpoint. */
export type ServerReadCall = { id: string; name: string; input: LooseRecord; output: unknown };

/** The terminal `done` SSE frame from `/api/assistant/turn`. */
export type DonePayload = {
  assistantText: string;
  readCalls: ServerReadCall[];
  proposals: ServerProposal[];
  apiMessages: unknown[];
};

/** A single turn request: either a fresh user message or a batch of tool results. */
export type TurnEvent =
  | { type: 'user'; text: string }
  | {
      type: 'tool_results';
      results: Array<{
        toolUseId: string;
        ok: boolean;
        output?: unknown;
        rejectionReason?: string;
      }>;
    };

/** User decision on a single proposal. */
export type ProposalDecision = {
  status: 'approved' | 'rejected';
  input?: LooseRecord;
  rejectionReason?: string;
};
