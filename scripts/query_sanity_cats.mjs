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
    console.log('Categories:', categories);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
