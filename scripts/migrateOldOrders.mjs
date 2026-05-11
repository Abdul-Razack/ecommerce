import { createClient } from '@sanity/client';
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const sql = postgres(process.env.DATABASE_URL);

async function migrateOrders() {
  try {
    console.log('Fetching old orders from PostgreSQL...');
    const oldOrders = await sql`SELECT * FROM orders`;
    console.log(`Found ${oldOrders.length} orders in PostgreSQL.`);

    for (const oldOrder of oldOrders) {
      console.log(`Migrating Order: ${oldOrder.order_id}...`);
      
      // Fetch items for this order
      const items = await sql`SELECT * FROM order_items WHERE order_id = ${oldOrder.order_id}`;

      const orderDoc = {
        _type: 'order',
        orderId: oldOrder.order_id,
        _createdAt: new Date(oldOrder.created_at).toISOString(),
        customer: {
          name: oldOrder.user_name,
          email: oldOrder.user_email,
          phone: oldOrder.user_phone,
        },
        shippingAddress: `${oldOrder.address}, ${oldOrder.city}, ${oldOrder.state} - ${oldOrder.pincode}`,
        items: items.map((item, idx) => ({
          _key: `item_${idx}`,
          name: item.product_name,
          price: parseFloat(item.product_price),
          quantity: item.quantity,
          // Note: references to products might be broken if IDs changed, 
          // so we store the name as a fallback.
        })),
        totalAmount: parseFloat(oldOrder.total_amount),
        status: oldOrder.order_status || 'confirmed',
        paymentStatus: oldOrder.payment_status || 'pending',
        razorpayOrderId: oldOrder.razorpay_order_id,
        razorpayPaymentId: oldOrder.razorpay_payment_id,
      };

      await sanityClient.create(orderDoc);
      console.log(`✓ Migrated ${oldOrder.order_id}`);
    }

    console.log('Migration Complete!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    await sql.end();
  }
}

migrateOrders();
