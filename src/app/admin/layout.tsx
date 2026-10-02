/**
 * Admin Layout (Next.js App Router layout.tsx)
 *
 * Route protection is enforced at two layers:
 *  1. Edge Proxy/Middleware (src/proxy.ts) redirects unauthenticated /admin/* requests to /admin/login
 *  2. AdminLayoutClient handles client-side transitions and renders the sidebar/navigation
 *  3. All /api/admin/* endpoints enforce server-side auth() session verification
 */
import { AdminLayoutClient } from './AdminLayoutClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
