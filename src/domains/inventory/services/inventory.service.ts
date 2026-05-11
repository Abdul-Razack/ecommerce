import { writeClient } from '@/shared/lib/sanity';

export const inventoryService = {
  /**
   * Atomically reduce stock for a list of items
   */
  async reduceStock(items: { _id: string, quantity: number }[]) {
    const results = [];
    for (const item of items) {
      try {
        const res = await writeClient
          .patch(item._id)
          .setIfMissing({ stock: 0 })
          .dec({ stock: item.quantity })
          .commit();
        results.push({ id: item._id, success: true });
      } catch (err) {
        console.error(`Stock reduction failed for ${item._id}:`, err.message);
        results.push({ id: item._id, success: false, error: err.message });
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
