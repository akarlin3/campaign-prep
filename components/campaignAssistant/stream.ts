import type { DonePayload } from './types';

/** A decoded SSE frame from the turn endpoint. */
export type TurnFrame =
  | { kind: 'chunk'; text: string }
  | { kind: 'done'; payload: DonePayload }
  | { kind: 'error'; error: string };

/**
 * Parse a single raw SSE event block (the text between `\n\n` separators) into a
 * typed frame, or `null` if it carries no actionable data / fails to parse.
 * Behavior matches the original inline parser: unknown events and partial
 * frames are silently ignored.
 */
export function parseTurnEvent(rawEvent: string): TurnFrame | null {
  if (!rawEvent.trim()) return null;
  let name = 'message';
  let dataLine = '';
  for (const line of rawEvent.split('\n')) {
    if (line.startsWith('event: ')) name = line.slice(7).trim();
    else if (line.startsWith('data: ')) dataLine = line.slice(6).trim();
  }
  if (!dataLine) return null;
  try {
    const parsed = JSON.parse(dataLine);
    if (name === 'chunk' && typeof parsed.text === 'string') {
      return { kind: 'chunk', text: parsed.text };
    }
    if (name === 'done') {
      return { kind: 'done', payload: parsed as DonePayload };
    }
    if (name === 'error') {
      return { kind: 'error', error: parsed.error || 'Stream error.' };
    }
    return null;
  } catch {
    // ignore partial-frame parse errors
    return null;
  }
}

/**
 * Consume an SSE response stream, invoking `onFrame` for each decoded frame.
 * Mirrors the original double-newline framing and trailing-buffer handling.
 */
export async function readTurnStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onFrame: (frame: TurnFrame) => void,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done: finished, value } = await reader.read();
    if (finished) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';
    for (const evt of events) {
      const frame = parseTurnEvent(evt);
      if (frame) onFrame(frame);
    }
  }
}
