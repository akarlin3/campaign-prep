import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gamemaster Assistant',
    short_name: 'GM Assist',
    description: 'TTRPG campaign prep — Lazy DM · CCD · Proactive Roleplaying',
    start_url: '/campaign',
    display: 'standalone',
    background_color: '#f5ecd7',
    theme_color: '#b1201e',
    icons: [
      {
        src: '/icons/base-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/base-icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
