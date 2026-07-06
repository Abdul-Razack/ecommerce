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
    const categories = await client.fetch('*[_type == "category"]{_id, name, "slug": slug.current}');
    console.log('Categories:', JSON.stringify(categories, null, 2));

    const products = await client.fetch('*[_type == "product"]{_id, name, "category": category->name, "slug": slug.current}');
    console.log('Products count:', products.length);
    console.log('Products:', JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
