import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ArtVest — Discover Talent. Build Teams. Back Ideas.',
  description:
    'A structured creative talent ecosystem where creative professionals showcase their craft, discover verified collaborators, and build community.',
  keywords: [
    'ArtVest',
    'Creative Talent',
    'Artist Portfolio',
    'Talent Discovery',
    'Music',
    'Film',
    'Dance',
    'Photography',
    'Design',
    'Production',
  ],
  authors: [{ name: 'ArtVest Team — PR1107 Major Project' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090A10] text-gray-100 selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
