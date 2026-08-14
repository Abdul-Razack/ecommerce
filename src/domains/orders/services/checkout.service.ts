import { writeClient } from '@/shared/lib/sanity';

export const checkoutService = {
  /**
   * Executes a single atomic Sanity transaction that creates the order 
   * and decrements inventory for all items simultaneously.
   * Utilizes Optimistic Concurrency Control (ifRevisionId) to guarantee
   * no partial deductions or race conditions.
   */
  async processCheckoutTransaction(orderDoc: any, items: { _id: string, quantity: number }[]) {
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const tx = writeClient.transaction();

        // 1. Fetch current stock and revision for all items
        const itemIds = items.map(i => i._id);
        const products = await writeClient.fetch(`*[_id in $itemIds] { _id, _rev, stock }`, { itemIds });
        
        // Ensure all products exist and have sufficient stock
        for (const item of items) {
          const product = products.find((p: any) => p._id === item._id);
          if (!product) {
            return { success: false, error: `Product not found: ${item._id}`, statusCode: 404 };
          }
          
          const currentStock = (product.stock as number) || 0;
          if (currentStock < item.quantity) {
            return { success: false, error: `Insufficient stock for product ${item._id}. Required: ${item.quantity}, Available: ${currentStock}`, statusCode: 409 };
          }
          
          // Queue the decrement patch using the strict revision id
          tx.patch(product._id, p => p
            .ifRevisionId(product._rev)
            .dec({ stock: item.quantity })
          );
        }

        // 2. Queue the order creation
        tx.create(orderDoc);

        // 3. Commit the entire transaction atomically
        // If ANY patch fails (e.g. revision mismatch), the order is not created and no stock is deducted.
        const result = await tx.commit();
        
        return { success: true, result };
      } catch (err: any) {
        // 409 Conflict or Revision mismatch indicates someone else mutated the document
        if (err.statusCode === 409 || err.message?.includes('Revision mismatch')) {
          retries--;
          lastError = err;
          // Exponential backoff
          await new Promise(res => setTimeout(res, (4 - retries) * 150));
        } else {
          // Other unexpected errors (network, schema validation)
          console.error('Atomic checkout transaction failed:', err.message);
          return { success: false, error: err.message, statusCode: 500 };
        }
      }
    }

    // Exhausted retries
    return { success: false, error: 'Checkout failed due to high concurrency. Please try again.', statusCode: 409, details: lastError?.message };
  }
};
