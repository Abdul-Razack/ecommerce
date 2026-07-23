import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

const CATEGORIES = [
  { name: 'Leggings', slug: 'leggings' },
  { name: 'Activewear', slug: 'activewear' },
  { name: 'Nighty', slug: 'nighty' },
  { name: 'Sarees', slug: 'sarees' }
];

const DUMMY_PRODUCTS = [
  // LEGGINGS
  {
    name: 'Onyx Core Legging',
    price: 1299,
    comparePrice: 1999,
    description: 'Our signature high-waisted legging with extreme stretch and non-transparent fabric.',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800&auto=format&fit=crop',
    catSlug: 'leggings',
    isFeatured: true,
  },
  {
    name: 'Bone Sculpt Legging',
    price: 1499,
    comparePrice: 2199,
    description: 'Sculpting legging with a soft bone finish and subtle side pockets.',
    image: 'https://images.unsplash.com/photo-1522849696084-818b292c60f5?q=80&w=800&auto=format&fit=crop',
    catSlug: 'leggings',
    isFeatured: false,
  },
  {
    name: 'Graphite Everyday Legging',
    price: 1099,
    comparePrice: 1599,
    description: 'The perfect everyday legging, designed for maximum comfort and flexibility.',
    image: 'https://images.unsplash.com/photo-1560931124-74c6ee6f2a63?q=80&w=800&auto=format&fit=crop',
    catSlug: 'leggings',
    isFeatured: false,
  },
  {
    name: 'Carbon Ribbed Legging',
    price: 1699,
    comparePrice: 2499,
    description: 'Premium ribbed legging offering superior hold and a textured look.',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop',
    catSlug: 'leggings',
    isFeatured: true,
  },

  // ACTIVEWEAR
  {
    name: 'Midnight Active Top',
    price: 899,
    comparePrice: 1299,
    description: 'Breathable and sweat-wicking active top for high intensity workouts.',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800&auto=format&fit=crop',
    catSlug: 'activewear',
    isFeatured: true,
  },
  {
    name: 'Chrome Flex Bra',
    price: 799,
    comparePrice: 1099,
    description: 'High support sports bra with chrome styling and soft fabric.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop',
    catSlug: 'activewear',
    isFeatured: false,
  },
  {
    name: 'Platinum Training Jacket',
    price: 1999,
    comparePrice: 2999,
    description: 'Lightweight zip-up jacket perfect for outdoor training and warmups.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
    catSlug: 'activewear',
    isFeatured: true,
  },
  {
    name: 'Obsidian Performance Shorts',
    price: 899,
    comparePrice: 1299,
    description: 'High-performance running shorts with inner liner and hidden pockets.',
    image: 'https://images.unsplash.com/photo-1538330627166-33d1908c210d?q=80&w=800&auto=format&fit=crop',
    catSlug: 'activewear',
    isFeatured: false,
  },

  // NIGHTY
  {
    name: 'Silk Lounge Nighty',
    price: 1899,
    comparePrice: 2499,
    description: 'Premium silk sleepwear designed for ultimate night-time comfort.',
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800&auto=format&fit=crop',
    catSlug: 'nighty',
    isFeatured: true,
  },
  {
    name: 'Cotton Breeze Nighty',
    price: 999,
    comparePrice: 1499,
    description: 'Lightweight cotton nighty with delicate lace detailing.',
    image: 'https://images.unsplash.com/photo-1526265218618-cb150f16f2b1?q=80&w=800&auto=format&fit=crop',
    catSlug: 'nighty',
    isFeatured: false,
  },
  {
    name: 'Satin Dream Nightdress',
    price: 2199,
    comparePrice: 3299,
    description: 'Luxurious satin nightdress falling elegantly at the knees.',
    image: 'https://images.unsplash.com/photo-1562157502-0e9e4f506846?q=80&w=800&auto=format&fit=crop',
    catSlug: 'nighty',
    isFeatured: true,
  },
  {
    name: 'Rose Gold Sleep Shirt',
    price: 1299,
    comparePrice: 1899,
    description: 'Comfortable oversized sleep shirt in a beautiful rose gold shade.',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    catSlug: 'nighty',
    isFeatured: false,
  },

  // SAREES
  {
    name: 'Royal Georgette Saree',
    price: 3499,
    comparePrice: 5999,
    description: 'Elegant georgette saree featuring intricate border embroidery.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    catSlug: 'sarees',
    isFeatured: true,
  },
  {
    name: 'Ivory Chiffon Saree',
    price: 2999,
    comparePrice: 4599,
    description: 'Minimalist chiffon saree in beautiful ivory with subtle embellishments.',
    image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac662?q=80&w=800&auto=format&fit=crop',
    catSlug: 'sarees',
    isFeatured: false,
  },
  {
    name: 'Emerald Silk Saree',
    price: 4599,
    comparePrice: 7999,
    description: 'Traditional pure silk saree in a stunning emerald green color with gold zari.',
    image: 'https://images.unsplash.com/photo-1583391733958-d25e07fac662?q=80&w=800&auto=format&fit=crop',
    catSlug: 'sarees',
    isFeatured: true,
  },
  {
    name: 'Crimson Banarasi Saree',
    price: 5299,
    comparePrice: 8999,
    description: 'Exquisite Banarasi saree woven with intricate crimson and gold patterns.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    catSlug: 'sarees',
    isFeatured: false,
  }
];

async function main() {
  console.log('Seeding Dummy Data...');
  
  const categoryIds = {};
  
  // 1. Create Categories
  console.log('Creating Categories...');
  for (const cat of CATEGORIES) {
    const doc = {
      _type: 'category',
      _id: `cat-${cat.slug}`,
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug }
    };
    
    const result = await client.createOrReplace(doc);
    categoryIds[cat.slug] = result._id;
    console.log(`✓ Category: ${cat.name}`);
  }

  // 2. Create Products
  console.log('Creating Products...');
  for (const prod of DUMMY_PRODUCTS) {
    const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const doc = {
      _type: 'product',
      _id: `prod-${slug}`,
      name: prod.name,
      slug: { _type: 'slug', current: slug },
      price: prod.price,
      comparePrice: prod.comparePrice,
      description: prod.description,
      externalImageUrl: prod.image,
      stock: 50,
      category: { _type: 'reference', _ref: categoryIds[prod.catSlug] },
      flags: {
        isFeatured: prod.isFeatured,
        isNewArrival: true,
        isTrending: prod.isFeatured
      }
    };

    await client.createOrReplace(doc);
    console.log(`✓ Product: ${prod.name}`);
  }

  // 3. Update HomePage
  console.log('Updating Homepage...');
  const catRefs = Object.values(categoryIds).slice(0, 3).map(id => ({
    _key: `hp-cat-${id}`,
    title: 'Featured Collection',
    category: { _type: 'reference', _ref: id }
  }));

  const featuredProducts = DUMMY_PRODUCTS.filter(p => p.isFeatured).map(p => {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return { _type: 'reference', _ref: `prod-${slug}`, _key: `hp-prod-${slug}` };
  });

  const homePageDoc = {
    _type: 'homePage',
    _id: 'homePage',
    hero: {
      heading: 'ONYX & BONE',
      subtext: 'The 2026 Premium Collection. Minimal aesthetics, maximum impact.',
      buttonText: 'SHOP THE EDIT',
    },
    featuredCollections: catRefs,
    trendingProducts: {
      heading: 'THE ESSENTIALS',
      products: featuredProducts,
    },
    editorial: {
      heading: 'Elevated Everyday',
      description: 'Discover forms that move with you, engineered for perfect comfort and effortless style.',
    },
    announcement: [
      'FREE EXPRESS SHIPPING OVER ₹1500',
      'NEW ONYX COLLECTION IS LIVE'
    ]
  };

  await client.createOrReplace(homePageDoc);
  console.log('✓ Homepage Updated');

  console.log('Dummy data seeding complete!');
}

main().catch(err => {
  console.error('Error during seeding:', err);
});
