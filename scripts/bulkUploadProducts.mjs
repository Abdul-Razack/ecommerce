import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const METADATA_DIR = 'C:/Users/Abdul Razack.A/Downloads/my learning/ecommerce/automation/data/output/raeesah catelogue 2024';
const CROPS_DIR = path.join(METADATA_DIR, 'crops');

async function uploadImage(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const imageData = fs.readFileSync(filePath);
    const asset = await client.assets.upload('image', imageData, {
      filename: path.basename(filePath),
    });
    return asset._id;
  } catch (error) {
    console.error(`Upload error for ${filePath}:`, error.message);
    return null;
  }
}

async function createProduct(name, assetIds, description) {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const doc = {
      _type: 'product',
      name,
      slug: { _type: 'slug', current: slug },
      price: 999, // Default price
      quantity: 50,
      description,
      mainImage: assetIds[0] ? { _type: 'image', asset: { _ref: assetIds[0] } } : undefined,
      gallery: assetIds.map((id, i) => ({
        _type: 'image',
        _key: `img_${i}`,
        asset: { _ref: id }
      })),
      flags: {
        isNewArrival: true
      }
    };

    const result = await client.create(doc);
    console.log(`✓ Created product: ${name}`);
    return result;
  } catch (error) {
    console.error(`✕ Failed to create product ${name}:`, error.message);
  }
}

async function main() {
  if (!fs.existsSync(METADATA_DIR)) {
    console.error('Metadata directory not found.');
    return;
  }

  const files = fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('_metadata.json')).sort();

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(METADATA_DIR, file), 'utf8'));
    
    let currentProduct = null;
    let assetIds = [];

    for (const item of data) {
      if (item.type === 'main_product') {
        if (currentProduct) await createProduct(currentProduct.name, assetIds, currentProduct.ocr);
        
        const cropPath = item.crop_asset ? path.join(CROPS_DIR, item.crop_asset) : null;
        const assetId = cropPath ? await uploadImage(cropPath) : null;
        
        const ocr = item.ocr_text || '';
        const nameMatch = ocr.match(/([A-Z][A-Z\s]{3,})/);
        const baseName = nameMatch ? nameMatch[1].trim() : 'Premium Apparel';
        
        currentProduct = { name: `${baseName} - ${file.slice(0, 8)}`, ocr };
        assetIds = assetId ? [assetId] : [];
      } else if (item.type === 'color_variant' && currentProduct) {
        const cropPath = item.crop_asset ? path.join(CROPS_DIR, item.crop_asset) : null;
        const assetId = cropPath ? await uploadImage(cropPath) : null;
        if (assetId) assetIds.push(assetId);
      }
    }
    
    if (currentProduct) await createProduct(currentProduct.name, assetIds, currentProduct.ocr);
  }
  
  console.log('Done!');
}

main();
