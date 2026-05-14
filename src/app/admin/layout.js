'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';
import Button from '@/shared/ui/Button';
import Skeleton from '@/shared/ui/Skeleton';

function AdminLayoutInner({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [status, pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen bg-white">
        <aside className="w-64 border-r border-zinc-100 p-8 space-y-8">
          <Skeleton className="h-10 w-32 mb-12" />
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-6 w-full" />)}
        </aside>
        <main className="flex-grow p-8">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }

  if (!session) return null;

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/stock', label: 'Inventory' },
    { href: '/admin/reports', label: 'Performance' },
    { href: '/studio', label: 'Sanity Studio' },
    { href: '/', label: 'View Store' },
  ];

  return (
    <div className="flex min-h-screen bg-white font-sans text-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-100 flex flex-col fixed inset-y-0 left-0 bg-white z-20">
        <div className="p-8 pb-12">
          <Link href="/admin" className="text-xl font-bold tracking-tight uppercase text-black">
            AURA ETHNIC
          </Link>
          <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mt-2">
            Administrator
          </p>
        </div>

        <nav className="flex-grow px-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-[11px] uppercase tracking-widest font-bold transition-all duration-200 ${
                    pathname === item.href 
                      ? 'bg-black text-white' 
                      : 'text-zinc-500 hover:text-black hover:bg-zinc-50'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-6 border-t border-zinc-100 space-y-4">
          <div className="px-2">
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Logged in as</p>
            <p className="text-xs font-semibold text-black truncate">{session.user?.name || session.user?.email}</p>
          </div>
          <Button 
            variant="outline" 
            fullWidth 
            size="sm"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="text-[10px] uppercase tracking-widest h-10 border-zinc-200 hover:border-black"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
