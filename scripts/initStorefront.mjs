import { createClient } from '@sanity/client';
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
  console.log('Fetching existing homePage...');
  const existing = await client.fetch(`*[_type == "homePage"][0]`);
  
  if (existing) {
    console.log('homePage already exists. Updating missing fields...');
    await client.patch(existing._id)
      .setIfMissing({
        hero: {
          heading: "WEAR YOUR confidence",
          subtext: "Trendy pieces. Timeless style. Posh Pigeon has everything you need to look and feel your best.",
          buttonText: "SHOP NEW IN"
        },
        promotionalBanner: {
          isActive: true,
          heading: "Spring Sale is Live!",
          subtext: "Enjoy up to 40% off on selected clothing collections.",
          discount: "40%"
        },
        globalCta: {
          heading: "JOIN THE COLLECTION",
          buttonText: "EXPLORE SHOP",
          buttonLink: "/shop"
        }
      })
      .commit();
    console.log('Updated existing homePage!');
  } else {
    console.log('Creating new homePage document...');
    await client.create({
      _type: 'homePage',
      hero: {
        heading: "WEAR YOUR confidence",
        subtext: "Trendy pieces. Timeless style. Posh Pigeon has everything you need to look and feel your best.",
        buttonText: "SHOP NEW IN"
      },
      promotionalBanner: {
        isActive: true,
        heading: "Spring Sale is Live!",
        subtext: "Enjoy up to 40% off on selected clothing collections.",
        discount: "40%"
      },
      globalCta: {
        heading: "JOIN THE COLLECTION",
        buttonText: "EXPLORE SHOP",
        buttonLink: "/shop"
      }
    });
    console.log('Created homePage document!');
  }
}

run().catch(console.error);
