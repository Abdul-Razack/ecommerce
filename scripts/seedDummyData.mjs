import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
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
  useCdn: false,
});

const CATEGORIES = [
  { name: 'Leggings', slug: 'leggings', description: '4-way stretchable ankle & churidar leggings' },
  { name: 'Chudidar', slug: 'chudidar', description: 'Designer ready-made salwar kameez & dress materials' },
  { name: 'Lehenga', slug: 'lehenga', description: 'Bridal, party wear & festive chaniya cholis' },
  { name: 'Children Silk Skirt', slug: 'children-silk-skirt', description: 'Traditional kids Pattupavadai & silk skirts' },
  { name: 'Nighty', slug: 'nighty', description: 'Soft pure cotton nighties & lounge wear' },
  { name: 'Inskirt', slug: 'inskirt', description: 'Anti-chafing saree inskirts & shapewear petticoats' },
  { name: 'Sarees', slug: 'sarees', description: 'Pure silk, soft silk & daily cotton sarees' },
  { name: 'Kurtis', slug: 'kurtis', description: 'Anarkali kurtis, straight tunics & ethnic tops' }
];

const DUMMY_PRODUCTS = [
  // LEGGINGS
  {
    name: 'Royal Blue 4-Way Stretch Churidar Leggings',
    price: 499,
    comparePrice: 799,
    description: 'Ultra-soft combed cotton with 4-way stretch, non-transparent, bio-washed for zero color fading.',
    image: 'https://assets0.mirraw.com/images/8288550/RoyalBlue_4fe606c6-8430-41df-812b-c2b0eb46bb6d_zoom.jpg?1600076914',
    catSlug: 'leggings',
    isFeatured: true,
  },
  {
    name: 'Ankle-Length Premium Cotton Leggings - Maroon',
    price: 449,
    comparePrice: 699,
    description: 'Breathable, non-see-through cotton ankle length leggings with comfortable elastic waistband.',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=800&auto=format&fit=crop',
    catSlug: 'leggings',
    isFeatured: true,
  },
  {
    name: 'Classic Black Stretchable Churidar Legging',
    price: 499,
    comparePrice: 799,
    description: 'Everyday essential black churidar legging engineered for flexibility and sleek fit.',
    image: 'https://images.unsplash.com/photo-1560931124-74c6ee6f2a63?q=80&w=800&auto=format&fit=crop',
    catSlug: 'leggings',
    isFeatured: false,
  },
  {
    name: 'Skin Tone Nude Saree Companion Leggings',
    price: 499,
    comparePrice: 799,
    description: 'Nude skin tone stretch legging ideal for pairing under tunics and semi-transparent suits.',
    image: 'https://images.unsplash.com/photo-1522849696084-818b292c60f5?q=80&w=800&auto=format&fit=crop',
    catSlug: 'leggings',
    isFeatured: false,
  },

  // CHUDIDAR
  {
    name: 'Embroidered Chanderi Silk Chudidar Suit Set',
    price: 1899,
    comparePrice: 2899,
    description: 'Hand-crafted embroidery on premium Chanderi silk top paired with dupattas and tailored churidar bottoms.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    catSlug: 'chudidar',
    isFeatured: true,
  },
  {
    name: 'Floral Print Cotton Salwar Kameez Set',
    price: 1299,
    comparePrice: 1999,
    description: 'Soft pure cotton daily wear Chudidar kameez with printed chiffon dupatta.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    catSlug: 'chudidar',
    isFeatured: true,
  },
  {
    name: 'Designer Georgette Straight Chudidar Dress Material',
    price: 1499,
    comparePrice: 2299,
    description: 'Unstitched georgette dress material featuring intricate zari work and matching churidar fabric.',
    image: 'https://images.unsplash.com/photo-1583391733975-ac8275525547?q=80&w=800&auto=format&fit=crop',
    catSlug: 'chudidar',
    isFeatured: false,
  },

  // LEHENGA
  {
    name: 'Royal Velvet Festive Lehenga Choli',
    price: 3999,
    comparePrice: 5999,
    description: 'Heavy gold thread dori & sequin work lehenga set crafted for weddings and grand festive celebrations.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
    catSlug: 'lehenga',
    isFeatured: true,
  },
  {
    name: 'Pastel Floral Organza Partywear Lehenga',
    price: 2999,
    comparePrice: 4499,
    description: 'Lightweight organza flared skirt paired with matching embroidered blouse piece.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    catSlug: 'lehenga',
    isFeatured: true,
  },
  {
    name: 'Traditional Silk Chaniya Choli Set',
    price: 3499,
    comparePrice: 4999,
    description: 'Ethnic silk pleated chaniya choli with contrast bandhani dupatta.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    catSlug: 'lehenga',
    isFeatured: false,
  },

  // CHILDREN SILK SKIRT (PATTUPAVADAI)
  {
    name: 'Traditional Kanchi Border Pattupavadai Silk Skirt Set',
    price: 1199,
    comparePrice: 1799,
    description: 'Authentic South Indian kids silk skirt & golden border blouse set for festivals and temple visits.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop',
    catSlug: 'children-silk-skirt',
    isFeatured: true,
  },
  {
    name: 'Kids Jacquard Art Silk Pattu Pavadai - Peacock Green',
    price: 999,
    comparePrice: 1499,
    description: 'Soft inner lining art silk skirt with contrasting rich zari work for young girls.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop',
    catSlug: 'children-silk-skirt',
    isFeatured: true,
  },

  // NIGHTY
  {
    name: 'Pure Cotton Printed Feeding Nighty',
    price: 699,
    comparePrice: 999,
    description: '100% breathable pure cotton nighty with front zips for easy nursing and all-night comfort.',
    image: 'https://www.ankitadesigns.in/cdn/shop/files/350nilima.png?v=1777283189',
    catSlug: 'nighty',
    isFeatured: true,
  },
  {
    name: 'Soft Alpine Floral Maxi Nightgown',
    price: 799,
    comparePrice: 1199,
    description: 'Full-length maxi nightwear crafted from premium alpine cotton with delicate embroidery.',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=800&auto=format&fit=crop',
    catSlug: 'nighty',
    isFeatured: false,
  },

  // INSKIRT
  {
    name: 'Poplin Cotton Saree Inskirt - Classic Red',
    price: 349,
    comparePrice: 499,
    description: '100% pure poplin cotton 6-cut inskirt with durable drawstring waist.',
    image: 'https://jisboutique.com/cdn/shop/files/24_166af726-83fd-4c7c-a62f-54444fbbefc3.jpg?v=1718281040',
    catSlug: 'inskirt',
    isFeatured: true,
  },
  {
    name: 'Fish-Cut Microfiber Saree Shapewear Inskirt',
    price: 699,
    comparePrice: 999,
    description: 'Seamless stretchable saree shapewear petticoat that defines your curves and eliminates bulky pleats.',
    image: 'https://jisboutique.com/cdn/shop/files/24_166af726-83fd-4c7c-a62f-54444fbbefc3.jpg?v=1718281040',
    catSlug: 'inskirt',
    isFeatured: true,
  },

  // SAREES
  {
    name: 'Pure Kanchipuram Soft Silk Saree',
    price: 3499,
    comparePrice: 5499,
    description: 'Rich contrast woven zari border with matching unstitched blouse piece.',
    image: 'https://pochampallysarees.com/cdn/shop/files/PureSoftSilkBlueYellowSari.jpg?v=1762248060',
    catSlug: 'sarees',
    isFeatured: true,
  },
  {
    name: 'Mulmul Cotton Handloom Daily Saree',
    price: 1299,
    comparePrice: 1899,
    description: 'Ultra-lightweight summer cotton saree with block printed motifs and tasselled pallu.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    catSlug: 'sarees',
    isFeatured: true,
  },

  // KURTIS
  {
    name: 'Anarkali Flared Cotton Kurti with Dupatta',
    price: 1499,
    comparePrice: 2199,
    description: 'Floor length pleated Anarkali tunic crafted from pure breathable Jaipur cotton.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    catSlug: 'kurtis',
    isFeatured: true,
  },
  {
    name: 'Straight Cut Rayon Daily Wear Tunic',
    price: 799,
    comparePrice: 1199,
    description: 'Comfortable side-slit rayon tunic ideal for daily office and college wear.',
    image: 'https://images.unsplash.com/photo-1583391733975-ac8275525547?q=80&w=800&auto=format&fit=crop',
    catSlug: 'kurtis',
    isFeatured: false,
  }
];

async function main() {
  console.log('--- Step 1: Creating All Women\'s Apparel Categories ---');
  const catMap = {};

  for (const cat of CATEGORIES) {
    const doc = {
      _type: 'category',
      _id: `cat-${cat.slug}`,
      name: cat.name,
      slug: { _type: 'slug', current: cat.slug },
      description: cat.description,
    };
    const res = await client.createOrReplace(doc);
    catMap[cat.slug] = res._id;
    console.log(`✓ Created Category: ${cat.name} (${res._id})`);
  }

  console.log('\n--- Step 2: Creating Products ---');
  for (const prod of DUMMY_PRODUCTS) {
    const slugStr = prod.name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-');
    const doc = {
      _type: 'product',
      _id: `prod-${slugStr}`,
      name: prod.name,
      slug: { _type: 'slug', current: slugStr },
      price: prod.price,
      comparePrice: prod.comparePrice,
      description: prod.description,
      stock: 50,
      isFeatured: prod.isFeatured,
      category: {
        _type: 'reference',
        _ref: catMap[prod.catSlug],
      },
      externalImageUrl: prod.image,
      variants: [
        { color: 'Standard', size: 'M', stock: 25, price: prod.price },
        { color: 'Standard', size: 'L', stock: 25, price: prod.price }
      ]
    };

    await client.createOrReplace(doc);
    console.log(`✓ Created Product: ${prod.name}`);
  }

  console.log('\n🎉 Successfully updated all Posh Pigeon categories and products!');
}

main().catch(err => console.error(err));
