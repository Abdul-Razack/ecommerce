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
  ExternalLink 
} from 'lucide-react';

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
      <div suppressHydrationWarning className="flex min-h-screen bg-white">
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
    <div suppressHydrationWarning className="flex min-h-screen bg-white font-sans text-black">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-100 flex flex-col fixed inset-y-0 left-0 bg-white z-20">
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
