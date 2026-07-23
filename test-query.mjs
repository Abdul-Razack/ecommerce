import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function run() {
  const products = await client.fetch(`*[_type == "product" && category->slug.current == "sarees"] | order(_createdAt desc)[0...4] {
      _id, name,
      "imageUrl": coalesce(mainImage.asset->url, select(externalImageUrl != "" => externalImageUrl), variants[0].images[0].asset->url, select(variants[0].externalImageUrls[0] != "" => variants[0].externalImageUrls[0]))
  }`);
  console.log(JSON.stringify(products, null, 2));
}
run();
