import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

async function run() {
  try {
    console.log('Linking newly created products to the homepage CMS configurations...');
    const productRefs = [
      { _type: 'reference', _ref: 'prod-churidar-leggings' },
      { _type: 'reference', _ref: 'prod-premium-shapewear' }
    ];

    await client
      .patch('homePage')
      .set({ 
        'trendingProducts.products': productRefs,
        'trendingProducts.heading': 'TRENDING NOW'
      })
      .commit();
    console.log('✓ Homepage CMS updated to display new products.');
  } catch (error) {
    console.error('Failed to link products to homepage:', error.message);
  }
}

run();
