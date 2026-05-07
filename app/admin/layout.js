'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import { useEffect } from 'react';

function AdminLayoutInner({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [status, pathname, router]);

  // Don't show sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/orders', label: 'Orders', icon: '📦' },
    { href: '/admin/stock', label: 'Stock', icon: '🏪' },
    { href: '/admin/reports', label: 'Reports', icon: '📈' },
    { href: '/studio', label: 'Products (CMS)', icon: '🎨' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>ShopVerse</h2>
          <p>Admin Panel</p>
        </div>

        <ul className="admin-nav">
          {navItems.map((item) => (
            <li key={item.href} className="admin-nav-item">
              <Link
                href={item.href}
                className={`admin-nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div style={{ padding: '16px 24px', marginTop: 'auto', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {session.user?.name}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      <div className="admin-content">
        {children}
      </div>
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
