import { client } from '@/shared/lib/sanity';

export const categoryService = {
  /**
   * Fetch all categories ordered by name
   */
  async getCategories() {
    return await client.fetch(`
      *[_type == "category" && name in ["Leggings", "Nighty", "Inskirt", "Sarees"]] | order(name asc) {
        _id, name, slug, image
      }
    `);
  }
};
