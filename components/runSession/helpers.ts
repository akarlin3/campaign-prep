// Pure, side-effect-free helpers extracted from RunSessionView.tsx.
// Logic is identical to the originals — moved here to slim the main file.

import type { PlotSegueType } from '@/lib/generators/types';

export function rollDice(expr: string): { result: number; breakdown: string } | null {
  const cleaned = expr.replace(/\s+/g, '').toLowerCase();
  const match = cleaned.match(/^(\d*)d(\d+)([+\-]\d+)?$/);
  if (!match) return null;
  const count = Math.max(1, Math.min(99, parseInt(match[1] || '1', 10)));
  const sides = Math.max(2, parseInt(match[2], 10));
  const mod = match[3] ? parseInt(match[3], 10) : 0;
  const rolls: number[] = [];
  for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
  const sum = rolls.reduce((a, b) => a + b, 0);
  const breakdown = `${count}d${sides}${mod ? (mod > 0 ? `+${mod}` : mod) : ''} = [${rolls.join(', ')}]${mod ? ` ${mod > 0 ? '+' : ''}${mod}` : ''}`;
  return { result: sum + mod, breakdown };
}

export function parseYoutubeUrl(urlOrId: string): { playlistId: string | null; videoId: string | null } {
  const trimmed = urlOrId.trim();
  if (!trimmed) return { playlistId: null, videoId: null };

  if (/^PL[a-zA-Z0-9_-]{16,38}$/.test(trimmed) || /^[a-zA-Z0-9_-]{18,40}$/.test(trimmed)) {
    if (trimmed.startsWith('PL')) {
      return { playlistId: trimmed, videoId: null };
    }
    if (trimmed.length === 11) {
      return { playlistId: null, videoId: trimmed };
    }
  }

  let playlistId: string | null = null;
  let videoId: string | null = null;

  try {
    const url = new URL(trimmed);
    playlistId = url.searchParams.get('list');

    if (url.pathname === '/watch') {
      videoId = url.searchParams.get('v');
    } else if (url.pathname.startsWith('/embed/')) {
      const parts = url.pathname.split('/');
      if (parts[2] && parts[2] !== 'videoseries') {
        videoId = parts[2];
      }
    } else {
      const hostname = url.hostname.toLowerCase();
      if (hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      }
    }
  } catch (e) {
    const listMatch = trimmed.match(/[&?]list=([a-zA-Z0-9_-]+)/);
    if (listMatch) playlistId = listMatch[1];

    const vMatch = trimmed.match(/[&?]v=([a-zA-Z0-9_-]+)/);
    if (vMatch) videoId = vMatch[1];

    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) videoId = shortMatch[1];
  }

  return { playlistId, videoId };
}

export const DEFAULT_SCENARIOS = [
  { id: 'tavern', name: '🍻 Tavern Ambiance', url: 'https://music.youtube.com/playlist?list=PLMISnIZ64usLtFZB6qQz5ZwAIGac9u51C' },
  { id: 'combat', name: '⚔ Epic Combat', url: 'https://music.youtube.com/playlist?list=PLMISnIZ64usL75jru3fcE5FSeBNvPGrNR' },
  { id: 'dungeon', name: '🧭 Dark Dungeon', url: 'https://music.youtube.com/playlist?list=PLMISnIZ64usJN0bbHZaIGlUbLcLx3WIN0' },
  { id: 'creepy', name: '💀 Eerie Suspense', url: 'https://music.youtube.com/playlist?list=PLMISnIZ64usLdXApbAah04QGU7COj7_eX' },
];

export const SEGUE_ENTRIES: { id: string; type: PlotSegueType; title: string }[] = [
  { id: 'segue:bridge',       type: 'bridge',       title: 'Plot Segue: Bridge' },
  { id: 'segue:complication', type: 'complication', title: 'Plot Segue: Complication' },
  { id: 'segue:cliffhanger',  type: 'cliffhanger',  title: 'Plot Segue: Cliffhanger' },
];
