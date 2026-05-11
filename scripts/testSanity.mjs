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

async function test() {
  try {
    console.log('Testing Sanity Connection...');
    console.log(`Project: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    
    const data = await client.fetch('*[_type == "product"][0]');
    
    if (data) {
      console.log('✅ Connection Successful!');
      console.log(`Found product: ${data.name}`);
    } else {
      console.log('⚠️ Connected but no products found.');
    }
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
  }
}

test();
