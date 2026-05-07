import './globals.css';

export const metadata = {
  title: 'ENERGY - Premium Activewear Store',
  description: 'Discover premium activewear designed for performance and styled for life. Free shipping on orders above ₹999.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
