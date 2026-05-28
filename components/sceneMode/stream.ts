// SSE stream parsing for /api/scene/turn. The route emits `chunk` events that
// accumulate narration text and a final `turn` event carrying the structured
// response, plus optional `error` events. This consumer is a faithful
// extraction of the original inline reader loop — same buffering, same event
// names, same parse-error tolerance.

import type { SceneTurnResponse } from '@/lib/scene/types';

export type SceneStreamHandlers = {
  onChunk: (accumulated: string) => void;
  onError: (message: string) => void;
};

export type SceneStreamResult = {
  finalResponse: SceneTurnResponse | null;
};

export async function consumeSceneTurnStream(
  res: Response,
  handlers: SceneStreamHandlers,
): Promise<SceneStreamResult> {
  const reader = res.body?.getReader();
  if (!reader) {
    handlers.onError('No response stream available.');
    return { finalResponse: null };
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';
  let finalResponse: SceneTurnResponse | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const evt of events) {
      if (!evt.trim()) continue;
      let eventName = 'message';
      let dataLine = '';
      for (const line of evt.split('\n')) {
        if (line.startsWith('event: ')) eventName = line.slice(7).trim();
        else if (line.startsWith('data: ')) dataLine = line.slice(6).trim();
      }
      if (!dataLine) continue;
      try {
        const parsed = JSON.parse(dataLine) as {
          text?: unknown;
          response?: unknown;
          error?: unknown;
        };
        if (eventName === 'chunk' && typeof parsed.text === 'string') {
          accumulated += parsed.text;
          handlers.onChunk(accumulated);
        } else if (eventName === 'turn' && parsed.response) {
          finalResponse = parsed.response as SceneTurnResponse;
        } else if (eventName === 'error') {
          handlers.onError(typeof parsed.error === 'string' ? parsed.error : 'Stream error.');
        }
      } catch {
        // ignore partial-event parse failures
      }
    }
  }

  return { finalResponse };
}
