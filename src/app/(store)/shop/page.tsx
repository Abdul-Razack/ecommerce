import { productService } from '@/domains/products/services/product.service';
import ProductCardWrapper from '@/domains/products/components/ProductCardWrapper';
import Container from '@/shared/ui/layout/Container';
import Link from 'next/link';
import Button from '@/shared/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'All Products - Posh Pigeon',
  description: 'Browse our complete collection of premium products at the best prices.',
};

export default async function ProductsPage({ searchParams }) {
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

  return (
    <div className="bg-bone min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-neutral-soft py-32 md:py-44 border-b border-onyx/5 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/shop-banner.png" 
            alt="Shop Banner" 
            className="w-full h-full object-cover object-center opacity-20" 
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
              <div className="text-5xl mb-6">📦</div>
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
