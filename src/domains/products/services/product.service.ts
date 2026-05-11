import { client } from '@/shared/lib/sanity';

export const productService = {
  /**
   * Fetch all products with optional GROQ filtering
   */
  async getProducts(filter?: string) {
    const query = filter 
      ? `*[_type == "product" && ${filter}]` 
      : `*[_type == "product"]`;
      
    return await client.fetch(`
      ${query} | order(_createdAt desc) {
        _id,
        name,
        "slug": slug.current,
        price,
        comparePrice,
        stock,
        description,
        "imageUrl": coalesce(images[0].asset->url, mainImage.asset->url),
        "gallery": gallery[].asset->url,
        "category": category->name
      }
    `);
  },

  /**
   * Fetch a single product by its slug
   */
  async getProductBySlug(slug: string) {
    return await client.fetch(`
      *[_type == "product" && slug.current == $slug][0] {
        _id,
        name,
        "slug": slug.current,
        price,
        comparePrice,
        description,
        "imageUrl": coalesce(images[0].asset->url, mainImage.asset->url),
        gallery,
        "category": category->name
      }
    `, { slug });
  },

  /**
   * Fetch related products within the same category
   */
  async getRelatedProducts(category: string, currentId: string) {
    return await client.fetch(`
      *[_type == "product" && category->name == $category && _id != $currentId][0...4] {
        _id, 
        name, 
        "slug": slug.current, 
        price, 
        "imageUrl": coalesce(images[0].asset->url, mainImage.asset->url), 
        "category": category->name
      }
    `, { category, currentId });
  },

  /**
   * Fetch products flagged as featured
   */
  async getFeaturedProducts() {
    return await client.fetch(`
      *[_type == "product" && flags.isFeatured == true][0...8] {
        _id, 
        name, 
        "slug": slug.current, 
        price, 
        "imageUrl": coalesce(images[0].asset->url, mainImage.asset->url), 
        "category": category->name
      }
    `);
  }
};
