'use client';

import { usePathname } from 'next/navigation';

export default function StoreMain({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <main className={`flex-grow pb-16 md:pb-0 ${isHome ? '' : 'pt-[100px] md:pt-[120px]'}`}>
      {children}
    </main>
  );
}
