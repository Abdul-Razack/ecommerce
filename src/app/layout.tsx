import '@/styles/globals.css';
import { Providers } from '@/providers/Providers';
import JsonLd from '@/shared/ui/JsonLd';
import { BRAND, organizationSchema, websiteSchema, siteUrl } from '@/shared/lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: BRAND.homepageTitle,
    template: '%s | Posh Pigeon',
  },
  description: BRAND.metaDescription,
  keywords: BRAND.defaultKeywords,
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
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
  alternates: {
    canonical: siteUrl(),
    languages: { 'en-IN': siteUrl() },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl(),
    siteName: BRAND.name,
    title: BRAND.homepageTitle,
    description: BRAND.metaDescription,
    images: [
      {
        url: BRAND.ogImage,
        width: 1200,
        height: 630,
        alt: 'Posh Pigeon — Premium Women\'s Apparel',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND.homepageTitle,
    description: BRAND.metaDescription,
    images: [BRAND.ogImage],
    creator: '@poshpigeon',
  },
  icons: {
    icon: '/images/logo.png',
    apple: '/images/logo.png',
  },
  other: {
    'theme-color': '#1C1917',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={organizationSchema()} />
        <JsonLd data={websiteSchema()} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-bone" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
