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
  { name: "Leggings", description: "Premium 4-way stretchable ankle & churidar leggings" },
  { name: "Chudidar", description: "Designer ready-made suits, salwar kameez & dress materials" },
  { name: "Lehenga", description: "Bridal, party wear & festive lehenga cholis" },
  { name: "Children Silk Skirt", description: "Traditional kids Pattupavadai & silk skirt sets" },
  { name: "Nighty", description: "Pure cotton & soft breathable nighties & loungewear" },
  { name: "Inskirt", description: "Seamless cotton inskirts & saree shapewear petticoats" },
  { name: "Sarees", description: "Kanchipuram silk, soft silk & daily cotton sarees" },
  { name: "Kurtis", description: "Anarkali, straight ethnic kurtis & stylish tunics" }
];

async function main() {
  console.log('Seeding updated women\'s apparel categories...');
  
  const categoryIds = [];
  
  for (const cat of CATEGORIES) {
    const slug = cat.name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-');
    const doc = {
      _type: 'category',
      _id: `cat-${slug}`,
      name: cat.name,
      slug: { _type: 'slug', current: slug },
      description: cat.description
    };
    
    const result = await client.createOrReplace(doc);
    categoryIds.push({ id: result._id, slug });
    console.log(`✓ Category created: ${cat.name} (${slug})`);
  }

  console.log('Done creating all categories!');
}

main();
