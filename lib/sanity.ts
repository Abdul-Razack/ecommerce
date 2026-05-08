import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

// Check if Sanity is properly configured
const isSanityConfigured = projectId && /^[a-z0-9-]+$/.test(projectId);

export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: true,
    })
  : null;

export const writeClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion: '2024-01-01',
      useCdn: false,
      token: process.env.SANITY_API_TOKEN,
    })
  : null;

const builder = client ? imageUrlBuilder(client) : null;

export function urlFor(source: any) {
  if (!builder) return { url: () => '/placeholder.png', width: () => ({ height: () => ({ url: () => '/placeholder.png' }) }) } as any;
  return builder.image(source);
}

// Fetch all products
export async function getProducts() {
  if (!client) return [];
  try {
    return await client.fetch(`
      *[_type == "product"] | order(_createdAt desc) {
        _id,
        name,
        slug,
        price,
        costPrice,
        quantity,
        description,
        images,
        featured,
        "category": category->name
      }
    `, {}, { cache: 'no-store' });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Fetch single product by slug
export async function getProduct(slug: string) {
  if (!client) return null;
  try {
    return await client.fetch(`
      *[_type == "product" && slug.current == $slug][0] {
        _id,
        name,
        slug,
        price,
        costPrice,
        description,
        images,
        featured,
        "category": category->name
      }
    `, { slug });
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Fetch featured products
export async function getFeaturedProducts() {
  if (!client) return [];
  try {
    return await client.fetch(`
      *[_type == "product" && featured == true] | order(_createdAt desc)[0...8] {
        _id,
        name,
        slug,
        price,
        images,
        "category": category->name
      }
    `);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Fetch categories
export async function getCategories() {
  if (!client) return [];
  try {
    return await client.fetch(`
      *[_type == "category"] | order(name asc) {
        _id,
        name,
        slug,
        image
      }
    `);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
