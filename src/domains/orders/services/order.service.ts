import { writeClient } from '@/shared/lib/sanity';

export const orderService = {
  /**
   * Create a new order document in Sanity
   */
  async createOrder(orderDoc: any) {
    return await writeClient.create(orderDoc);
  },

  /**
   * Fetch all orders for the admin view
   */
  async getAllOrders() {
    return await writeClient.fetch(`
      *[_type == "order"] | order(_createdAt desc)
    `);
  },

  /**
   * Fetch orders for a specific customer by email
   */
  async getOrdersByEmail(email: string) {
    return await writeClient.fetch(`
      *[_type == "order" && customer.email == $email] | order(_createdAt desc)
    `, { email });
  },

  /**
   * Fetch a single order by Order ID and Customer Email for secure tracking
   */
  async getOrderByOrderIdAndEmail(orderId: string, email: string) {
    return await writeClient.fetch(`
      *[_type == "order" && (orderId == $orderId || _id == $orderId) && lower(customer.email) == lower($email)][0] {
        _id,
        orderId,
        _createdAt,
        totalAmount,
        currency,
        status,
        paymentType,
        paymentStatus,
        trackingId,
        trackingUpdates,
        "customer": {
          "name": customer.name,
          "city": customer.city,
          "state": customer.state
        },
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
    `, { orderId, email });
  },

  /**
   * Update order status or tracking details
   */
  async updateOrder(orderId: string, patch: any) {
    // Find the internal Sanity ID first
    const sanityId = await writeClient.fetch(`
      *[_type == "order" && (orderId == $orderId || _id == $orderId)][0]._id
    `, { orderId });

    if (!sanityId) throw new Error('Order not found');

    return await writeClient
      .patch(sanityId)
      .set(patch)
      .commit();
  }
};
