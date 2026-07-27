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
    console.log('Fetching all products in Sanity...');
    const products = await client.fetch('*[_type == "product"] { _id, name }');
    console.log(`Found ${products.length} products to delete.`);
    
    if (products.length === 0) {
      console.log('No products found to clean.');
      return;
    }

    const productIds = products.map(p => p._id);

    // 1. Clean homepage references
    console.log('Checking homepage reference list...');
    const homePage = await client.getDocument('homePage');
    if (homePage && homePage.trendingProducts?.products) {
      console.log('Clearing trending products list on homepage...');
      await client
        .patch('homePage')
        .set({ 'trendingProducts.products': [] })
        .commit();
      console.log('✓ Homepage references cleared.');
    }

    // 2. Scan and handle any other documents referencing these products (like orders)
    console.log('Finding all other documents referencing these products...');
    const referencingDocs = await client.fetch(
      `*[references($ids)] { _id, _type }`,
      { ids: productIds }
    );

    if (referencingDocs.length > 0) {
      console.log(`Found ${referencingDocs.length} referencing documents. Processing cleanups...`);
      const txCleanup = client.transaction();
      
      for (const doc of referencingDocs) {
        if (doc._type === 'order') {
          console.log(`Deleting referencing order: ${doc._id}`);
          txCleanup.delete(doc._id);
        } else if (doc._type === 'homePage') {
          // Already handled homepage above, skip
        } else {
          console.log(`Found reference in document of type ${doc._type} (${doc._id}). Attempting to delete referencing document.`);
          txCleanup.delete(doc._id);
        }
      }
      
      await txCleanup.commit();
      console.log('✓ Reference cleanups committed.');
    }

    // 3. Delete products in bulk
    console.log('Deleting all products...');
    const txDelete = client.transaction();
    productIds.forEach(id => {
      txDelete.delete(id);
    });
    
    const result = await txDelete.commit();
    console.log('✓ Bulk delete of products completed successfully!');

  } catch (error) {
    console.error('Error during product cleanup:', error.message || error);
  }
}

run();
