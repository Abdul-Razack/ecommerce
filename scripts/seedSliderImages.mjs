import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function run() {
  console.log('Uploading images to Sanity...');
  
  // 1. Upload first image
  const image1Path = path.resolve('./public/images/banner-1.png');
  const image1Asset = await client.assets.upload('image', fs.createReadStream(image1Path), {
    filename: 'banner-1.png'
  });
  console.log('Uploaded image 1:', image1Asset._id);

  // 2. Upload second image
  const image2Path = path.resolve('./public/images/hero.png');
  const image2Asset = await client.assets.upload('image', fs.createReadStream(image2Path), {
    filename: 'hero.png'
  });
  console.log('Uploaded image 2:', image2Asset._id);

  // 3. Update the homePage document
  console.log('Updating homePage document with new slider images...');
  const homePage = await client.fetch('*[_type == "homePage"][0]');
  
  if (homePage) {
    await client.patch(homePage._id)
      .set({
        hero: {
          ...homePage.hero,
          images: [
            {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: image1Asset._id
              }
            },
            {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: image2Asset._id
              }
            }
          ]
        }
      })
      .commit();
    console.log('Successfully updated the Hero slider with 2 images!');
  } else {
    console.log('No homePage document found to update.');
  }
}

run().catch(console.error);
