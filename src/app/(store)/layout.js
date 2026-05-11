import Navbar from '@/shared/ui/layout/Navbar';
import Footer from '@/shared/ui/layout/Footer';
import MobileNav from '@/shared/ui/layout/MobileNav';
import CartDrawer from '@/domains/cart/components/CartDrawer';

import StoreMain from '@/shared/ui/layout/StoreMain';

export default function StoreLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CartDrawer />
      <StoreMain>
        {children}
      </StoreMain>
      <Footer />
      <MobileNav />
    </div>
  );
}
