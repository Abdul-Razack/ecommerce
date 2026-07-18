import React from 'react';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';
import { syncCustomerToSanity } from '@/shared/lib/customerSync';
import Container from '@/shared/ui/layout/Container';
import Section from '@/shared/ui/Section';
import Card from '@/shared/ui/Card';
import Input from '@/shared/ui/Input';
import Button from '@/shared/ui/Button';
import { updateProfile, addAddress, removeAddress } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { user } = await withAuth();
  
  if (!user) {
    redirect('/api/auth/login');
  }

  const customer = await syncCustomerToSanity(user);

  return (
    <div className="bg-gray-50 min-h-screen py-24">
      <Container className="max-w-4xl space-y-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">My Account</h1>
            <p className="text-gray-500 font-medium mt-2">Manage your personal details and saved addresses.</p>
          </div>
          <Link href="/account/orders">
            <Button className="font-bold uppercase tracking-widest text-[11px] rounded-xl px-8 h-12">
              View Order History
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Section */}
          <Card variant="outline" className="bg-white shadow-sm border-gray-100">
            <h2 className="text-xl font-black uppercase mb-6 border-b border-gray-100 pb-4">Personal Details</h2>
            <form action={updateProfile} className="space-y-6">
              <Input 
                label="Full Name" 
                name="name"
                defaultValue={customer?.name || ''} 
                placeholder="Enter your full name"
                required
              />
              <Input 
                label="Email Address" 
                name="email"
                type="email"
                defaultValue={customer?.email || ''} 
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
              <Input 
                label="Phone Number" 
                name="phone"
                defaultValue={customer?.phone || ''} 
                placeholder="Enter your phone number"
              />
              <div className="pt-4">
                <Button type="submit" className="w-full font-bold uppercase tracking-widest text-[11px] rounded-xl h-12">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>

          {/* Add Address Section */}
          <Card variant="outline" className="bg-white shadow-sm border-gray-100">
            <h2 className="text-xl font-black uppercase mb-6 border-b border-gray-100 pb-4">Add New Address</h2>
            <form action={addAddress} className="space-y-6">
              <Input label="Street Address" name="street" required placeholder="123 Main St, Apt 4B" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="City" name="city" required placeholder="Mumbai" />
                <Input label="State" name="state" required placeholder="Maharashtra" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="ZIP / Postal Code" name="zipCode" required placeholder="400001" />
                <Input label="Country" name="country" defaultValue="India" required />
              </div>
              <div className="pt-4">
                <Button type="submit" variant="outline" className="w-full font-bold uppercase tracking-widest text-[11px] rounded-xl h-12 border-2 border-black hover:bg-black hover:text-white transition-colors">
                  Save Address
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Container>

      {/* Saved Addresses List */}
      <Section title="Saved Addresses" className="pt-8 border-t border-gray-200 mt-12 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {customer?.savedAddresses?.length > 0 ? (
            customer.savedAddresses.map((addr: any) => (
              <Card key={addr._key} variant="outline" className="bg-white flex flex-col justify-between border-gray-200 hover:border-black transition-colors group relative overflow-hidden">
                <div className="space-y-2 mb-8">
                  {addr.isDefault && (
                    <span className="inline-block bg-black text-white text-[9px] uppercase tracking-widest font-black px-3 py-1 rounded-full mb-2">
                      Default
                    </span>
                  )}
                  <p className="font-bold text-gray-900">{addr.street}</p>
                  <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="text-sm text-gray-500">{addr.country}</p>
                </div>
                <form action={removeAddress.bind(null, addr._key)}>
                  <button type="submit" className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 underline decoration-2 underline-offset-4">
                    Remove Address
                  </button>
                </form>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400 font-medium italic text-sm">
              No saved addresses found. Add one above.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
