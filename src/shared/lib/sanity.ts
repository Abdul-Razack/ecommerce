import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

/**
 * Standard Read Client (Cdn enabled for performance)
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: true,
});

/**
 * Authenticated Write Client (Cdn disabled for immediate consistency)
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const builder = createImageUrlBuilder(client);

/**
 * Optimized Image URL Builder
 */
export function urlFor(source: any) {
  if (!source) return { url: () => '/placeholder.png' } as any;
  return builder.image(source);
}
