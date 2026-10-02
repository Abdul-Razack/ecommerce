'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';
import Button from '@/shared/ui/Button';
import Skeleton from '@/shared/ui/Skeleton';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  ShoppingCart, 
  Boxes, 
  BarChart3, 
  Store, 
  TicketPercent,
  ExternalLink,
  Menu,
  X 
} from 'lucide-react';
import { useState } from 'react';

function AdminLayoutInner({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [pathname]);

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
      <div suppressHydrationWarning className="flex min-h-screen bg-white">
        <aside className="hidden md:block w-64 border-r border-zinc-100 p-8 space-y-8">
          <Skeleton className="h-10 w-32 mb-12" />
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-6 w-full" />)}
        </aside>
        <main className="flex-grow p-4 md:p-8">
          <Skeleton className="h-full w-full" />
        </main>
      </div>
    );
  }

  if (!session) return null;

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: ShoppingBag },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
    { href: '/admin/stock', label: 'Inventory', icon: Boxes },
    { href: '/admin/reports', label: 'Performance', icon: BarChart3 },
    { href: '/admin/storefront', label: 'Storefront', icon: Store },
    { href: '/', label: 'View Store', icon: ExternalLink },
  ];

  return (
    <div suppressHydrationWarning className="flex flex-col md:flex-row min-h-screen bg-white font-sans text-black">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <img 
            src="/images/logo.png" 
            alt="Posh Pigeon Logo" 
            className="w-8 h-8 object-contain rounded-lg border border-zinc-100 bg-zinc-50 p-0.5"
          />
          <div>
            <Link href="/admin" className="text-xs font-black tracking-tight uppercase text-black block leading-none">
              POSH PIGEON
            </Link>
            <p className="text-[8px] uppercase tracking-widest font-extrabold text-zinc-400 mt-0.5">
              Admin Console
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className="p-2 text-zinc-700 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex animate-fade-in">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <aside className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-zinc-100 shadow-2xl z-50 animate-deploy">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/images/logo.png" 
                  alt="Posh Pigeon Logo" 
                  className="w-8 h-8 object-contain rounded-lg border border-zinc-100 bg-zinc-50 p-0.5"
                />
                <div>
                  <span className="text-xs font-black tracking-tight uppercase text-black block leading-none">
                    POSH PIGEON
                  </span>
                  <p className="text-[8px] uppercase tracking-widest font-extrabold text-zinc-400 mt-0.5">
                    Administrator
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-black rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-grow px-3 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileDrawerOpen(false)}
                        className={`flex items-center px-3.5 py-2.5 text-[11px] uppercase tracking-widest font-extrabold transition-all duration-200 rounded-xl ${
                          isActive 
                            ? 'bg-black text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-black hover:bg-zinc-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-5 border-t border-zinc-100 space-y-3">
              <div className="px-1">
                <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Logged in as</p>
                <p className="text-xs font-semibold text-black truncate">{session.user?.name || session.user?.email}</p>
              </div>
              <Button 
                variant="outline" 
                fullWidth 
                size="sm"
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="text-[9px] uppercase tracking-widest h-9 border-zinc-200 hover:border-black rounded-xl"
              >
                Logout
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar (Preserved exactly as-is on md: and up) */}
      <aside className="hidden md:flex w-64 border-r border-zinc-100 flex-col fixed inset-y-0 left-0 bg-white z-20">
        <div className="p-6 pb-8 border-b border-zinc-100 flex items-center gap-3">
          <img 
            src="/images/logo.png" 
            alt="Posh Pigeon Logo" 
            className="w-10 h-10 object-contain rounded-xl border border-zinc-100 bg-zinc-50 p-1"
          />
          <div>
            <Link href="/admin" className="text-sm font-black tracking-tight uppercase text-black block leading-none">
              POSH PIGEON
            </Link>
            <p className="text-[9px] uppercase tracking-widest font-extrabold text-zinc-400 mt-1">
              Administrator
            </p>
          </div>
        </div>

        <nav className="flex-grow px-4 py-6">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-[11px] uppercase tracking-widest font-extrabold transition-all duration-200 rounded-xl ${
                      isActive 
                        ? 'bg-black text-white shadow-sm' 
                        : 'text-zinc-500 hover:text-black hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-3 transition-colors ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
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
            className="text-[10px] uppercase tracking-widest h-10 border-zinc-200 hover:border-black rounded-xl"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow w-full md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
