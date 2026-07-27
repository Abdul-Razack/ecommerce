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
  const targetDocId = 'prod-satin-dream-nightdress';
  try {
    console.log(`Checking homepage document references to target product ID: ${targetDocId}`);
    
    // Fetch the homePage document
    const homePage = await client.getDocument('homePage');
    if (!homePage) {
      console.log('No homePage document found.');
    } else {
      console.log('homePage document found. Checking trendingProducts...');
      
      const originalProducts = homePage.trendingProducts?.products || [];
      const updatedProducts = originalProducts.filter(p => p._ref !== targetDocId);
      
      if (originalProducts.length !== updatedProducts.length) {
        console.log(`Found reference in homePage trending products list. Removing...`);
        await client
          .patch('homePage')
          .set({ 'trendingProducts.products': updatedProducts })
          .commit();
        console.log(`✓ Reference removed from homePage.`);
      } else {
        console.log(`No reference to this product found in the homepage document.`);
      }
    }

    // Now attempt to delete the product
    console.log(`Attempting to delete product document: ${targetDocId}`);
    const deleteResult = await client.delete(targetDocId);
    console.log('✓ Deletion result:', deleteResult);
    
  } catch (error) {
    console.error('Error during safe deletion process:', error.message || error);
  }
}

run();
