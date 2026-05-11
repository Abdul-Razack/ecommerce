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

const CATEGORIES = [
  "Leggings", "Bottomwear", "Women's Fashion", 
  "Patiala", "Premium Collection", "New Arrivals", "Accessories"
];

async function main() {
  console.log('Seeding categories...');
  
  const categoryIds = [];
  
  for (const name of CATEGORIES) {
    const slug = name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-');
    const doc = {
      _type: 'category',
      _id: `cat-${slug}`,
      name,
      slug: { _type: 'slug', current: slug }
    };
    
    const result = await client.createOrReplace(doc);
    categoryIds.push(result._id);
    console.log(`✓ Category: ${name}`);
  }

  // Assign to products
  const products = await client.fetch('*[_type == "product" && !defined(category)]');
  console.log(`Assigning categories to ${products.length} products...`);

  for (const product of products) {
    const randomCat = categoryIds[Math.floor(Math.random() * categoryIds.length)];
    await client
      .patch(product._id)
      .set({ category: { _type: 'reference', _ref: randomCat } })
      .commit();
  }

  console.log('Done!');
}

main();
