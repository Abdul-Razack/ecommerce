import { productService } from '@/domains/products/services/product.service';
import ProductCardWrapper from '@/domains/products/components/ProductCardWrapper';
import Container from '@/shared/ui/layout/Container';
import Link from 'next/link';
import Button from '@/shared/ui/Button';
import JsonLd from '@/shared/ui/JsonLd';
import { BRAND, siteUrl, breadcrumbSchema, faqSchema, categoryFaqs, collectionPageSchema } from '@/shared/lib/seo';
import type { Metadata } from 'next';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CATEGORY_META: Record<string, { title: string; description: string; keywords: string[] }> = {
  leggings: {
    title: 'Premium Stretchable Leggings — Posh Pigeon',
    description: 'Buy premium stretchable leggings online at Posh Pigeon. 4-way stretch, opaque, breathable fabric.',
    keywords: ['buy leggings online', 'premium leggings India', 'stretchable leggings women', 'churidar leggings'],
  },
  chudidar: {
    title: 'Designer Chudidar & Salwar Kameez — Posh Pigeon',
    description: 'Shop readymade Chudidar suit sets, salwar kameez & dress materials online at Posh Pigeon.',
    keywords: ['buy chudidar online', 'salwar kameez India', 'readymade chudidar set', 'ethnic suit material'],
  },
  lehenga: {
    title: 'Bridal & Festive Lehenga Choli — Posh Pigeon',
    description: 'Explore royal bridal & partywear lehenga cholis online at Posh Pigeon. Heavy embroidery & rich fabrics.',
    keywords: ['buy lehenga online', 'party wear lehenga', 'bridal lehenga choli', 'chaniya choli India'],
  },
  'children-silk-skirt': {
    title: 'Kids Pattupavadai & Children Silk Skirts — Posh Pigeon',
    description: 'Shop traditional kids Pattupavadai silk skirt & blouse sets for festive celebrations at Posh Pigeon.',
    keywords: ['kids pattupavadai online', 'children silk skirt', 'pattu pavadai set', 'traditional kids wear'],
  },
  nighty: {
    title: 'Women\'s Pure Cotton Nighties & Loungewear — Posh Pigeon',
    description: 'Shop cosy cotton nighties, feeding nightwear, and loungewear for women at Posh Pigeon.',
    keywords: ['buy nighties online', 'cotton nighty India', 'feeding nighty', 'women sleepwear'],
  },
  inskirt: {
    title: 'Poplin Cotton & Shapewear Inskirts — Posh Pigeon',
    description: 'Buy anti-chafing cotton inskirts and saree shapewear petticoats at Posh Pigeon.',
    keywords: ['buy inskirt online', 'saree inskirt India', 'shapewear petticoat', 'anti chafing inskirt'],
  },
  sarees: {
    title: 'Kanchipuram Silk & Soft Cotton Sarees — Posh Pigeon',
    description: 'Shop elegant silk, organza & daily wear cotton sarees online at Posh Pigeon.',
    keywords: ['buy sarees online', 'kanchipuram silk saree', 'soft silk saree', 'cotton sarees online'],
  },
  kurtis: {
    title: 'Ethnic Kurtis, Anarkalis & Tunics — Posh Pigeon',
    description: 'Shop stylish Anarkali kurtis, straight-cut daily tunics and festive tops at Posh Pigeon.',
    keywords: ['buy kurtis online', 'anarkali kurti India', 'ethnic tunics women', 'daily wear kurti'],
  },
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ category?: string; search?: string }> }): Promise<Metadata> {
  const { category, search } = await searchParams;

  if (category && CATEGORY_META[category]) {
    const meta = CATEGORY_META[category];
    return {
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      alternates: { canonical: siteUrl(`/shop?category=${category}`) },
      openGraph: {
        title: meta.title,
        description: meta.description,
        url: siteUrl(`/shop?category=${category}`),
        type: 'website',
      },
    };
  }

  if (search) {
    return {
      title: `Search results for "${search}" — Posh Pigeon`,
      description: `Browse products matching "${search}" at Posh Pigeon. Premium women's apparel.`,
      alternates: { canonical: siteUrl(`/shop?search=${encodeURIComponent(search)}`) },
      robots: { index: false, follow: true },
    };
  }

  return {
    title: 'Shop All Products — Posh Pigeon',
    description:
      'Browse our complete collection of premium leggings, sarees, nighties and inskirts. Free shipping on orders above ₹999.',
    alternates: { canonical: siteUrl('/shop') },
    openGraph: {
      title: 'Shop All Products — Posh Pigeon',
      description: 'Browse our complete collection of premium women\'s apparel.',
      url: siteUrl('/shop'),
    },
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string; search?: string }> }) {
  const { category, search } = await searchParams;
  let products = [];

  try {
    const filters = [];
    if (category) {
      filters.push(`category->slug.current == "${category}"`);
    }
    if (search) {
      filters.push(`(name match "*${search}*" || description match "*${search}*")`);
    }
    const filterString = filters.length > 0 ? filters.join(' && ') : undefined;
    products = await productService.getProducts(filterString);
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  const pageTitle = category
    ? CATEGORY_META[category]?.title || 'Shop Products — Posh Pigeon'
    : search
      ? `Search: ${search} — Posh Pigeon`
      : 'Shop All Products — Posh Pigeon';
  const pageDescription = category
    ? CATEGORY_META[category]?.description || 'Browse products at Posh Pigeon.'
    : search
      ? `Browse products matching "${search}" at Posh Pigeon.`
      : 'Browse our complete collection of premium women\'s apparel.';

  const breadcrumbItems = [
    { name: 'Home', url: siteUrl('/') },
    { name: 'Shop', url: siteUrl('/shop') },
  ];
  if (category) {
    breadcrumbItems.push({
      name: CATEGORY_META[category]?.title?.split(' — ')[0] || category,
      url: siteUrl(`/shop?category=${category}`),
    });
  }

  // Build ItemList for category page JSON-LD
  const itemList = products.map((p, i) => ({
    name: p.name,
    url: siteUrl(`/shop/${p.slug}`),
    image: p.imageUrl,
    position: i + 1,
  }));

  return (
    <div className="bg-bone min-h-screen">
      {/* SEO JSON-LD */}
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      {category && itemList.length > 0 && (
        <JsonLd
          data={collectionPageSchema(pageTitle, pageDescription, siteUrl(`/shop?category=${category}`), itemList)}
        />
      )}
      {category && categoryFaqs[category] && (
        <JsonLd data={faqSchema(categoryFaqs[category])} />
      )}

      {/* Hero Section */}
      <div className="relative bg-neutral-soft py-14 sm:py-20 md:py-44 border-b border-onyx/5 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/shop-banner.png" 
            alt="Shop Banner" 
            className="w-full h-full object-cover object-[60%_center] opacity-25 md:opacity-20" 
          />
        </div>
        
        <Container className="relative z-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-onyx animate-kinetic-reveal">Shop</h1>
            <div className="flex items-center gap-2 text-[10px] text-onyx/50 font-bold uppercase tracking-[0.2em]">
              <Link href="/" className="hover:text-onyx transition-colors">Home</Link>
              <span>&gt;</span>
              <span className="text-onyx">Shop</span>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Grid */}
      <section className="py-20">
        <Container>
          {products.length > 0 ? (
            <ProductCardWrapper products={products} />
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Package className="w-12 h-12 text-zinc-400 stroke-[1.5] mb-6" />
              <h2 className="text-xl font-bold text-onyx mb-2">No Products Yet</h2>
              <p className="text-sm text-onyx/60 mb-8 max-w-xs">
                Our inventory is currently being updated. Please check back later.
              </p>
              <Link href="/">
                <Button variant="outline" className="uppercase tracking-widest text-[10px]">
                  Return Home
                </Button>
              </Link>
            </div>
          )}
        </Container>
      </section>
    </div>
  );
}
