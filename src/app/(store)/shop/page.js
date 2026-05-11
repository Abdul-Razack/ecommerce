import { productService } from '@/domains/products/services/product.service';
import ProductCardWrapper from '@/domains/products/components/ProductCardWrapper';
import Container from '@/shared/ui/layout/Container';
import Link from 'next/link';
import Button from '@/shared/ui/Button';

export const revalidate = 60;

export const metadata = {
  title: 'All Products - Energy',
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
      {/* Header */}
      <div className="bg-zinc-50 border-b border-zinc-100 py-16">
        <Container>
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-400 mb-4 block">
              Our Collection
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-black mb-2 uppercase">
              {category ? category.replace(/-/g, ' ') : 'All Products'}
            </h1>
            <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
              Showing {products.length} Items
            </p>
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
