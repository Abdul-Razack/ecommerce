import React, { Suspense } from 'react';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { syncCustomerToSanity } from '@/shared/lib/customerSync';
import { client } from '@/shared/lib/sanity';
import Container from '@/shared/ui/layout/Container';
import Skeleton from '@/shared/ui/Skeleton';
import AccountDashboard from './AccountDashboard';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/api/auth/login');
  }

  const customer = await syncCustomerToSanity(user);
  if (!customer) {
    redirect('/api/auth/login');
  }

  // Fetch orders matching the customer's email or customerRef
  const orders = await client.fetch(`
    *[_type == "order" && (customer.email == $email || customerRef._ref == $customerId)] | order(_createdAt desc) {
      _id,
      orderId,
      _createdAt,
      totalAmount,
      status,
      paymentType,
      paymentStatus,
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
  `, { email: user.email, customerId: customer._id });

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-20 md:pt-12 md:pb-28">
      <Container className="max-w-6xl space-y-8">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black">My Account</h1>
          <p className="text-gray-500 font-medium mt-2">
            Manage your personal profile, delivery addresses, and track shipments.
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
          <AccountDashboard customer={customer} orders={orders || []} />
        </Suspense>
      </Container>
    </div>
  );
}
