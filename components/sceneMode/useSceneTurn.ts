// Turn-runner state + logic for an active scene, extracted from the panel so
// the scattered useState calls (pcAction, streaming, streamText, error) and the
// long inline send/stream flow live in one cohesive unit. Behavior is identical
// to the original: same request building, same auth, same streaming, same
// post-turn effects ordering (record turn → reveal mentions → voice check).

import { useRef, useState } from 'react';
import {
  makeSceneId,
  type SceneEntry,
  type SceneTurn,
  type SceneTurnResponse,
} from '@/lib/scene/types';
import { buildSceneTurnRequest } from '@/lib/scene/context';
import { getIdToken, str, type LooseRecord } from './helpers';
import { postSceneTurn, summarizeTurns } from './api';
import { consumeSceneTurnStream } from './stream';

type UseSceneTurnArgs = {
  activeScene: SceneEntry | null;
  locations: LooseRecord[];
  npcs: LooseRecord[];
  // Append a completed turn to the scene and clear the input/stream buffers.
  onTurnRecorded: (sceneId: string, turn: SceneTurn) => void;
  // Post-turn effects, run after the turn is recorded (kept in the panel so
  // they can touch reveal/voice-check state).
  onTurnComplete: (sceneId: string, turn: SceneTurn, response: SceneTurnResponse) => void;
};

export type SceneTurnController = {
  pcAction: string;
  setPcAction: (v: string) => void;
  streaming: boolean;
  streamText: string;
  error: string | null;
  sendTurn: () => Promise<void>;
  cancel: () => void;
};

export function useSceneTurn({
  activeScene,
  locations,
  npcs,
  onTurnRecorded,
  onTurnComplete,
}: UseSceneTurnArgs): SceneTurnController {
  const [pcAction, setPcAction] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendTurn = async () => {
    const action = pcAction.trim();
    if (!action || streaming || !activeScene) return;
    setError(null);
    setStreamText('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    const scene = activeScene;

    try {
      const idToken = await getIdToken();
      const location = locations.find((l) => str(l.id) === scene.locationId) ?? {};
      const presentNpcs = npcs.filter((n) => scene.presentNpcIds.includes(str(n.id)));

      const requestBody = await buildSceneTurnRequest({
        location,
        npcs: presentNpcs,
        scene: { partyState: scene.partyState, turns: scene.turns },
        newAction: action,
        summarizeTurns: (turns) => summarizeTurns(idToken, turns),
      });

      const res = await postSceneTurn(idToken, requestBody, controller.signal);

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        setError(errBody.error || `HTTP ${res.status}`);
        setStreaming(false);
        return;
      }

      const { finalResponse } = await consumeSceneTurnStream(res, {
        onChunk: setStreamText,
        onError: setError,
      });

      if (finalResponse) {
        const turn: SceneTurn = {
          id: makeSceneId(),
          pcAction: action,
          response: finalResponse,
          createdAt: Date.now(),
        };
        onTurnRecorded(scene.id, turn);
        setPcAction('');
        setStreamText('');

        // @-mention reveals + voice check run after the turn is recorded.
        onTurnComplete(scene.id, turn, finalResponse);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') setError(err.message);
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const cancel = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return { pcAction, setPcAction, streaming, streamText, error, sendTurn, cancel };
}
