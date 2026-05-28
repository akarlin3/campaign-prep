// Shared type definitions for the Run Session view and its sub-components.
// Extracted verbatim from RunSessionView.tsx — no semantic changes.

export type PinKind = 'scene' | 'npc' | 'location' | 'monster' | 'item';
export type PinRef = { kind: PinKind; key: string };

// Kept as `any` deliberately: the main component relies on the loose return
// type at hundreds of `get(...)` call sites. Tightening these would ripple
// through the whole component and change behavior, so they are preserved.
export type Get = (k: string, fb: any) => any;
export type SetVal = (k: string, v: any) => void;

export type SessionSyncAnchor = {
  positionSec: number;
  anchorWallTimeMs: number;
  playlistIndex: number;
};

export const SECTION_KEYS = [
  'scenes', 'secrets', 'npcs', 'locations', 'monsters', 'magicItems', 'goals', 'clocks',
] as const;

export type SectionKey = typeof SECTION_KEYS[number];
