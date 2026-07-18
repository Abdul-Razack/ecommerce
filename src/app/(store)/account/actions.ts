'use server';

import { writeClient } from '@/shared/lib/sanity';
import { revalidatePath } from 'next/cache';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { syncCustomerToSanity } from '@/shared/lib/customerSync';

export async function updateProfile(formData: FormData) {
  const { user } = await withAuth();
  if (!user) throw new Error('Not authenticated');

  const customer = await syncCustomerToSanity(user);
  if (!customer) throw new Error('Customer not found');

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  await writeClient.patch(customer._id)
    .set({
      name: name || customer.name,
      phone: phone || customer.phone,
    })
    .commit();

  revalidatePath('/account');
  return { success: true };
}

export async function addAddress(formData: FormData) {
  const { user } = await withAuth();
  if (!user) throw new Error('Not authenticated');

  const customer = await syncCustomerToSanity(user);
  if (!customer) throw new Error('Customer not found');

  const newAddress = {
    _key: crypto.randomUUID(),
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string,
    zipCode: formData.get('zipCode') as string,
    country: formData.get('country') as string || 'India',
    isDefault: formData.get('isDefault') === 'on',
  };

  // If new address is default, we'd need to set others to false, but for simplicity we'll just append it for now
  await writeClient.patch(customer._id)
    .setIfMissing({ savedAddresses: [] })
    .append('savedAddresses', [newAddress])
    .commit();

  revalidatePath('/account');
  return { success: true };
}

export async function removeAddress(addressKey: string) {
  const { user } = await withAuth();
  if (!user) throw new Error('Not authenticated');

  const customer = await syncCustomerToSanity(user);
  if (!customer) throw new Error('Customer not found');

  await writeClient.patch(customer._id)
    .unset([`savedAddresses[_key=="${addressKey}"]`])
    .commit();

  revalidatePath('/account');
  return { success: true };
}
