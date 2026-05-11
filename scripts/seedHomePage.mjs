import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  console.log('Seeding Starter Homepage...');

  // 1. Get some existing products for the "Trending" section
  const products = await client.fetch('*[_type == "product"][0...4] { _id }');
  const productRefs = products.map(p => ({ _type: 'reference', _ref: p._id }));

  // 2. Get some existing categories
  const categories = await client.fetch('*[_type == "category"][0...3] { _id, name, "slug": slug.current }');

  const homePageDoc = {
    _type: 'homePage',
    _id: 'homePage',
    hero: {
      heading: 'ENERGY COLLECTION',
      subtext: 'High-performance essentials for the modern athlete.',
      buttonText: 'SHOP THE DROP',
    },
    featuredCollections: categories.map(cat => ({
      _key: `cat_${cat._id}`,
      title: cat.name,
      category: { _type: 'reference', _ref: cat._id },
    })),
    trendingProducts: {
      heading: 'TRENDING NOW',
      products: productRefs,
    },
    editorial: {
      heading: 'Sustainable Excellence',
      description: 'Our latest series focuses on high-impact performance with low-impact materials.',
    },
    announcement: [
      'FREE SHIPPING ON ORDERS OVER ₹2000',
      'NEW SEASON ARRIVALS NOW LIVE',
      'UP TO 40% OFF SELECT ITEMS'
    ]
  };

  try {
    await client.createOrReplace(homePageDoc);
    console.log('✓ Starter Homepage seeded successfully!');
  } catch (error) {
    console.error('Failed to seed homepage:', error.message);
  }
}

main();
