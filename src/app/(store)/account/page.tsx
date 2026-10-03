import React, { Suspense } from 'react';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { syncCustomerToSanity } from '@/shared/lib/customerSync';
import { client } from '@/shared/lib/sanity';
import Container from '@/shared/ui/layout/Container';
import Skeleton from '@/shared/ui/Skeleton';
import AccountDashboard from './AccountDashboard';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  let user: any = null;
  const signInUrl = '/api/auth/login';

  try {
    const authData = await withAuth();
    user = authData.user;
  } catch (err) {
    console.warn('WorkOS auth session check:', err);
  }

  let customer = null;
  if (user) {
    try {
      customer = await syncCustomerToSanity(user);
    } catch (e) {
      console.error('Error syncing customer:', e);
    }
  }

  // If no customer record found or user not signed in
  if (!customer) {
    customer = {
      _id: '',
      name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email ? user.email.split('@')[0] : ''),
      email: user?.email || '',
      phone: '',
      workosId: user?.id || null,
      savedAddresses: [],
    };
  }

  // Fetch orders matching customer email
  let orders = [];
  if (customer.email) {
    try {
      orders = await client.fetch(`
        *[_type == "order" && (customer.email == $email || customerRef._ref == $customerId)] | order(_createdAt desc) {
          _id,
          orderId,
          _createdAt,
          totalAmount,
          status,
          paymentType,
          paymentStatus,
          currency,
          trackingId,
          trackingUpdates,
          customer,
          items[] {
            name,
            price,
            quantity,
            color,
            size,
            "productImage": product->mainImage.asset->url,
            "productName": product->name
          }
        }
      `, { email: customer.email, customerId: customer._id });
    } catch (e) {
      orders = [];
    }
  }

  return (
    <div className="bg-bone min-h-screen pt-6 sm:pt-10 pb-16 md:pb-24">
      <Container className="max-w-6xl space-y-6 sm:space-y-8">
        
        {/* Page Title Header */}
        <div className="border-b border-onyx/10 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-onyx">My Account</h1>
            <p className="text-xs sm:text-sm text-onyx/60 font-medium mt-1">
              Manage your personal profile, delivery address book, and order tracking.
            </p>
          </div>

          {!user && (
            <a 
              href={signInUrl}
              className="px-5 py-2.5 bg-onyx text-white hover:bg-black font-black uppercase tracking-widest text-[10px] rounded-xl transition-all shadow-sm flex items-center gap-2 w-fit"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span>Sign In / Register</span>
            </a>
          )}
        </div>

        <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
          <AccountDashboard customer={customer} orders={orders || []} isGuest={!user} signInUrl={signInUrl} />
        </Suspense>
      </Container>
    </div>
  );
}

