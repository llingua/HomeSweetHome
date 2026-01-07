import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'HomeSweetHome Dashboard',
  description: 'Liquid glass Home Assistant dashboard demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="bg-liquid-radial text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
