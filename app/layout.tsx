import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/firebase/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Campaign Prep',
  description: 'TTRPG campaign prep — Lazy DM · CCD · Proactive Roleplaying',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100 font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
