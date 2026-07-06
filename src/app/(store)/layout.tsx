import Navbar from '@/shared/ui/layout/Navbar';
import Footer from '@/shared/ui/layout/Footer';
import MobileNav from '@/shared/ui/layout/MobileNav';
import CartDrawer from '@/domains/cart/components/CartDrawer';
import StoreMain from '@/shared/ui/layout/StoreMain';
import { withAuth, signOut } from '@workos-inc/authkit-nextjs';

export default async function StoreLayout({ children }) {
  const { user } = await withAuth();

  async function handleSignOut() {
    'use server';
    await signOut();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} signInUrl="/api/auth/login" onSignOut={handleSignOut} />
      <CartDrawer />
      <StoreMain>
        {children}
      </StoreMain>
      <Footer />
      <MobileNav user={user} signInUrl="/api/auth/login" onSignOut={handleSignOut} />
    </div>
  );
}
