import type { Metadata } from 'next';
import { Cinzel, Plus_Jakarta_Sans, Noto_Serif_JP } from 'next/font/google';
import './globals.css';

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '600', '700', '900'],
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  variable: '--font-kanji',
  display: 'swap',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'THE BLOOD-SOAKED SAMURAI',
  description: 'A dark, photorealistic Japanese historical cinematic scroll experience chronicling a lone ronin in the aftermath of battle.',
  openGraph: {
    title: 'THE BLOOD-SOAKED SAMURAI',
    description: 'A dark, photorealistic Japanese historical cinematic scroll experience chronicling a lone ronin in the aftermath of battle.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE BLOOD-SOAKED SAMURAI',
    description: 'A dark, photorealistic Japanese historical cinematic scroll experience chronicling a lone ronin in the aftermath of battle.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${sans.variable} ${notoSerifJP.variable} dark`}>
      <head>
        <meta name="theme-color" content="#070709" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#070709] text-[#e8e4dc] font-sans antialiased selection:bg-[#8b1515] selection:text-[#f8f5f0] overflow-x-hidden min-h-screen"
      >
        {children}
      </body>
    </html>
  );
}

