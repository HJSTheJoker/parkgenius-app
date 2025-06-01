import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from 'react-hot-toast';

import { Providers } from '@/components/providers';
import { cn } from '@/lib/utils';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ParkGenius - AI-Powered Theme Park Planning',
    template: '%s | ParkGenius',
  },
  description:
    'Optimize your theme park experience with AI-powered predictions, real-time crowd analysis, and personalized itinerary planning. Make every moment magical.',
  keywords: [
    'theme park',
    'planning',
    'AI',
    'predictions',
    'wait times',
    'accessibility',
    'Disney',
    'Universal',
    'Six Flags',
  ],
  authors: [{ name: 'ParkGenius Team' }],
  creator: 'ParkGenius',
  publisher: 'ParkGenius',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://parkgenius.vercel.app'
  ),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ParkGenius - AI-Powered Theme Park Planning',
    description:
      'Optimize your theme park experience with AI-powered predictions and personalized planning.',
    siteName: 'ParkGenius',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ParkGenius - Smart Theme Park Planning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ParkGenius - AI-Powered Theme Park Planning',
    description:
      'Optimize your theme park experience with AI-powered predictions and personalized planning.',
    images: ['/images/og-image.png'],
    creator: '@parkgenius',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon-16x16.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, poppins.variable)}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <main className="flex-1">{children}</main>
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}