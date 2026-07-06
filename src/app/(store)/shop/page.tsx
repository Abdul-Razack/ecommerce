import { productService } from '@/domains/products/services/product.service';
import ProductCardWrapper from '@/domains/products/components/ProductCardWrapper';
import Container from '@/shared/ui/layout/Container';
import Link from 'next/link';
import Button from '@/shared/ui/Button';

export const revalidate = 60;

export const metadata = {
  title: 'All Products - Posh Pigeon',
  description: 'Browse our complete collection of premium products at the best prices.',
};

export default async function ProductsPage({ searchParams }) {
  const { category } = await searchParams;
  let products = [];

  try {
    if (category) {
      products = await productService.getProducts(`category->slug.current == "${category}"`);
    } else {
      products = await productService.getProducts();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#F8F6F4] py-12 md:py-16 border-b border-zinc-150">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-4">
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black uppercase">Shop</h1>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">
                <Link href="/" className="hover:text-black transition-colors">Home</Link>
                <span>&gt;</span>
                <span className="text-black">Shop</span>
              </div>
            </div>
            <div className="md:col-span-7 rounded-2xl overflow-hidden shadow-tactile border border-zinc-100 aspect-[21/9]">
              <img src="/shop_banner_rack.png" className="w-full h-full object-cover" alt="Shop Apparel Banner" />
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
              <h2 className="text-xl font-bold text-black mb-2">No Products Yet</h2>
              <p className="text-sm text-zinc-500 mb-8 max-w-xs">
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
