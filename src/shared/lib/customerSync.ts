import { writeClient } from '@/shared/lib/sanity';
import type { User } from '@workos-inc/node';

export async function syncCustomerToSanity(user: User | null) {
  if (!user) return null;

  try {
    // Check if customer exists
    const existingCustomer = await writeClient.fetch(`
      *[_type == "customer" && workosId == $workosId][0]
    `, { workosId: user.id });

    if (existingCustomer) {
      return existingCustomer;
    }

    // Create new customer
    const newCustomer = {
      _type: 'customer',
      workosId: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      email: user.email,
      savedAddresses: [],
    };

    const createdCustomer = await writeClient.create(newCustomer);
    return createdCustomer;
  } catch (error) {
    console.error('Error syncing customer to Sanity:', error);
    return null;
  }
}
