import { client } from '@/shared/lib/sanity';

export const categoryService = {
  /**
   * Fetch all categories ordered by name
   */
  async getCategories() {
    return await client.fetch(`
      *[_type == "category"] | order(name asc) {
        _id, name, slug, image
      }
    `);
  }
};
