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
        "imageUrl": coalesce(mainImage.asset->url, externalImageUrl),
        "gallery": gallery[].asset->url,
        "externalGalleryUrls": externalGalleryUrls,
        "category": category->name,
        variants
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
        "imageUrl": coalesce(mainImage.asset->url, externalImageUrl),
        gallery,
        "externalGalleryUrls": externalGalleryUrls,
        "category": category->name,
        variants
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
        "imageUrl": coalesce(mainImage.asset->url, externalImageUrl), 
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
        "imageUrl": coalesce(mainImage.asset->url, externalImageUrl), 
        "category": category->name
      }
    `);
  }
};
