import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Sora } from 'next/font/google';
import Providers from './providers';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'HomeSweetHome Dashboard',
  description: 'Liquid glass Home Assistant dashboard demo',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${sora.variable} ${manrope.variable}`}>
      <body className="bg-liquid-radial text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
