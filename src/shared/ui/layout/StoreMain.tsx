'use client';

import { usePathname } from 'next/navigation';

export default function StoreMain({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main className="flex-grow" suppressHydrationWarning>
      {children}
    </main>
  );
}
