import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

// Normalized mappings of table names to folder names
const LEGGINGS_IMAGE_DIR = 'public/images/chudi leggings';
const SHAPEWEAR_IMAGE_DIR = 'public/images/shapewear';

const leggingsConfig = [
  { name: 'WHITE', code: '2', folder: 'white', stock: { S: 30, M: 30, L: 60, XL: 60, XXL: 60, '3XL': 60 } },
  { name: 'BLACK', code: '3', folder: 'black', stock: { S: 30, M: 30, L: 60, XL: 60, XXL: 60, '3XL': 60 } },
  { name: 'RANI', code: '4', folder: 'rani', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
  { name: 'CORAL', code: '6', folder: 'coral', stock: { S: 15, M: 15, L: 20, XL: 20, XXL: 20, '3XL': 20 } },
  { name: 'BOTTLE GREEN', code: '7', folder: 'bottle green', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
  { name: 'MAROON', code: '9', folder: 'maroon', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
  { name: 'WINE', code: '10', folder: 'wine', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
  { name: 'F.RED', code: '15', folder: 'F.red', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
  { name: 'T.BLUE', code: '19', folder: 'T.blue', stock: { S: 15, M: 15, L: 20, XL: 20, XXL: 20, '3XL': 20 } },
  { name: 'ST GREY', code: '20', folder: 'st.grey', stock: { S: 15, M: 15, L: 20, XL: 20, XXL: 20, '3XL': 20 } },
  { name: 'NAVY', code: '21', folder: 'navy', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
  { name: 'MINT GREEN', code: '24', folder: 'mint green', stock: { S: 15, M: 15, L: 20, XL: 20, XXL: 20, '3XL': 20 } },
  { name: 'REED MAROOM', code: '26', folder: 'Reed Maroom', stock: { S: 15, M: 15, L: 20, XL: 20, XXL: 20, '3XL': 20 } },
  { name: 'R. GREEN', code: '34', folder: 'R.Green', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
  { name: 'MUSTERD', code: '41', folder: 'musterd', stock: { S: 15, M: 15, L: 20, XL: 20, XXL: 20, '3XL': 20 } },
  { name: 'CHIKKU', code: '42', folder: 'chikku', stock: { S: 30, M: 30, L: 40, XL: 40, XXL: 40, '3XL': 40 } },
];

const shapewearConfig = [
  { name: 'BLACK', code: '1', folder: 'black', stock: { L: 100, XL: 100, XXL: 100 } },
  { name: 'NAVY', code: '3', folder: 'navy', stock: { L: 60, XL: 60, XXL: 60 } },
  { name: 'FAWN', code: '4', folder: 'fawn', stock: { L: 60, XL: 60, XXL: 60 } },
  { name: 'RANI', code: '5', folder: 'rani', stock: { L: 60, XL: 60, XXL: 60 } },
  { name: 'RED', code: '8', folder: 'red', stock: { L: 40, XL: 40, XXL: 40 } },
  { name: 'ICE PEACH', code: '9', folder: 'ice peach', stock: { L: 60, XL: 60, XXL: 60 } },
  { name: 'PISTA GREEN', code: '11', folder: 'pista green', stock: { L: 40, XL: 40, XXL: 40 } },
  { name: 'ST GREY', code: '13', folder: 'st grey', stock: { L: 40, XL: 40, XXL: 40 } },
  { name: 'WINE', code: '14', folder: 'wine', stock: { L: 40, XL: 40, XXL: 40 } },
  { name: 'LT GREY', code: '15', folder: 'LT grey', stock: { L: 40, XL: 40, XXL: 40 } },
];

// Helper to upload directory files as Sanity image assets
async function uploadFolderImages(folderPath) {
  if (!fs.existsSync(folderPath)) {
    console.log(`Directory does not exist: ${folderPath}`);
    return [];
  }

  const files = fs.readdirSync(folderPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
  });

  console.log(`Found ${files.length} images in ${folderPath}`);
  const assetRefs = [];

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    try {
      console.log(`Uploading asset: ${filePath}...`);
      const stream = fs.createReadStream(filePath);
      const asset = await client.assets.upload('image', stream, {
        filename: file
      });
      console.log(`✓ Uploaded as: ${asset._id}`);
      assetRefs.push({
        _type: 'image',
        _key: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      });
    } catch (err) {
      console.error(`Failed to upload ${filePath}:`, err.message);
    }
  }

  return assetRefs;
}

async function run() {
  try {
    // 1. Process Leggings
    console.log('\n======================================');
    console.log('1. PROCESSING CHURIDAR LEGGINGS');
    console.log('======================================');
    
    const leggingsVariants = [];
    let leggingsFirstImageRef = null;

    for (const colorItem of leggingsConfig) {
      const folderPath = path.resolve(__dirname, '..', LEGGINGS_IMAGE_DIR, colorItem.folder);
      console.log(`\nProcessing color ${colorItem.name}...`);
      
      const images = await uploadFolderImages(folderPath);
      if (images.length > 0 && !leggingsFirstImageRef) {
        leggingsFirstImageRef = images[0].asset._ref;
      }

      // Generate variant per size
      for (const [size, stockQty] of Object.entries(colorItem.stock)) {
        const sku = `cl-${colorItem.name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`;
        leggingsVariants.push({
          _key: `var_${Date.now()}_${colorItem.code}_${size}`,
          sku,
          color: colorItem.name,
          size,
          stock: stockQty,
          images: images.length > 0 ? images : []
        });
      }
    }

    const leggingsProductDoc = {
      _type: 'product',
      _id: 'prod-churidar-leggings',
      name: 'Posh Pigeon Premium Churidar Leggings',
      slug: { _type: 'slug', current: 'premium-churidar-leggings' },
      price: 599,
      comparePrice: 999,
      description: 'Experience unmatched comfort and style with our premium Churidar Leggings. Tailored from top-grade combed cotton-spandex blend, these leggings feature four-way flex stretch, high opacity (non-transparent), and a skin-friendly feel perfect for daily wear.',
      category: {
        _type: 'reference',
        _ref: 'cat-leggings'
      },
      variants: leggingsVariants,
      stock: leggingsVariants.reduce((sum, v) => sum + v.stock, 0)
    };

    if (leggingsFirstImageRef) {
      leggingsProductDoc.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: leggingsFirstImageRef
        }
      };
    }

    console.log('\nSaving Churidar Leggings product document to Sanity...');
    const leggingsResult = await client.createOrReplace(leggingsProductDoc);
    console.log('✓ Created product document:', leggingsResult._id);


    // 2. Process Shapewear
    console.log('\n======================================');
    console.log('2. PROCESSING PREMIUM SHAPEWEAR');
    console.log('======================================');
    
    const shapewearVariants = [];
    let shapewearFirstImageRef = null;

    for (const colorItem of shapewearConfig) {
      const folderPath = path.resolve(__dirname, '..', SHAPEWEAR_IMAGE_DIR, colorItem.folder);
      console.log(`\nProcessing color ${colorItem.name}...`);
      
      const images = await uploadFolderImages(folderPath);
      if (images.length > 0 && !shapewearFirstImageRef) {
        shapewearFirstImageRef = images[0].asset._ref;
      }

      // Generate variant per size
      for (const [size, stockQty] of Object.entries(colorItem.stock)) {
        const sku = `sw-${colorItem.name.toLowerCase().replace(/\s+/g, '-')}-${size.toLowerCase()}`;
        shapewearVariants.push({
          _key: `var_${Date.now()}_${colorItem.code}_${size}`,
          sku,
          color: colorItem.name,
          size,
          stock: stockQty,
          images: images.length > 0 ? images : []
        });
      }
    }

    const shapewearProductDoc = {
      _type: 'product',
      _id: 'prod-premium-shapewear',
      name: 'Posh Pigeon Premium Saree Shapewear',
      slug: { _type: 'slug', current: 'premium-saree-shapewear' },
      price: 999,
      comparePrice: 1499,
      description: 'Achieve the perfect silhouette with our Premium Saree Shapewear. Engineered to substitute traditional inskirts, it provides seamless hugging, flatters your curves with light control, and features a side-slit for ease of movement. Soft, anti-chafing, and highly breathable.',
      category: {
        _type: 'reference',
        _ref: 'cat-inskirt'
      },
      variants: shapewearVariants,
      stock: shapewearVariants.reduce((sum, v) => sum + v.stock, 0)
    };

    if (shapewearFirstImageRef) {
      shapewearProductDoc.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: shapewearFirstImageRef
        }
      };
    }

    console.log('\nSaving Premium Shapewear product document to Sanity...');
    const shapewearResult = await client.createOrReplace(shapewearProductDoc);
    console.log('✓ Created product document:', shapewearResult._id);

    console.log('\n======================================');
    console.log('✓ ALL PRODUCTS LOADED SUCCESSFULLY!');
    console.log('======================================');

  } catch (error) {
    console.error('Error loading products with images:', error);
  }
}

run();
