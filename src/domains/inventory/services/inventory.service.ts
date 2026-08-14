import { writeClient } from '@/shared/lib/sanity';

export const inventoryService = {
  /**
   * Atomically reduce stock for a list of items using optimistic concurrency control (ifRevisionID)
   */
  async reduceStock(items: { _id: string, quantity: number }[]) {
    const results = [];
    
    for (const item of items) {
      let retries = 3;
      let success = false;
      let lastError = null;

      while (retries > 0 && !success) {
        try {
          // 1. Fetch current stock and revision
          const product = await writeClient.getDocument(item._id);
          
          if (!product) {
            throw new Error(`Product not found: ${item._id}`);
          }

          const currentStock = (product.stock as number) || 0;

          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${item._id}. Required: ${item.quantity}, Available: ${currentStock}`);
          }

          // 2. Attempt to patch with ifRevisionID constraint
          await writeClient
            .transaction()
            .patch(item._id, p => p
              .ifRevisionId(product._rev)
              .dec({ stock: item.quantity })
            )
            .commit();
          
          success = true;
          results.push({ id: item._id, success: true });
        } catch (err: any) {
          if (err.statusCode === 409 || err.message.includes('Revision mismatch')) {
            // Concurrency conflict, retry
            retries--;
            lastError = err;
            await new Promise(res => setTimeout(res, 100)); // backoff
          } else {
            // Other error (e.g. out of stock)
            console.error(`Stock reduction failed for ${item._id}:`, err.message);
            results.push({ id: item._id, success: false, error: err.message });
            break; // don't retry on logical errors
          }
        }
      }

      if (!success && retries === 0) {
        console.error(`Stock reduction failed for ${item._id} after retries due to concurrency conflicts.`);
        results.push({ id: item._id, success: false, error: 'Concurrency conflict or out of stock' });
      }
    }

    return results;
  },

  /**
   * Fetch current inventory levels for all products
   */
  async getInventoryLevels() {
    return await writeClient.fetch(`
      *[_type == "product"] {
        _id,
        name,
        stock,
        costPrice
      }
    `);
  }
};
