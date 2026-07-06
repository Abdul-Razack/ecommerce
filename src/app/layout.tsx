import '@/styles/globals.css';
import { Providers } from '@/providers/Providers';

export const metadata = {
  title: 'Posh Pigeon - Premium Women\'s Apparel',
  description: 'Discover premium women\'s clothing including leggings, nighties, inskirts, and sarees designed for comfort and style.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-bone">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
