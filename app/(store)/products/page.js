import { getProducts } from '@/lib/sanity';
import ProductCardWrapper from '@/components/features/product/ProductCardWrapper';
import Link from 'next/link';

export const revalidate = 60;

export const metadata = {
  title: 'All Products - Energy',
  description: 'Browse our complete collection of premium products at the best prices.',
};

export default async function ProductsPage() {
  let products = [];

  try {
    products = await getProducts();
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="section-title">All Products</h1>
          <p className="section-subtitle">
            Browse our complete collection of {products.length} products
          </p>
        </div>

        {products.length > 0 ? (
          <ProductCardWrapper products={products} />
        ) : (
          <div className="cart-empty">
            <div className="cart-empty-icon">📦</div>
            <h2>No Products Yet</h2>
            <p>Products will appear here once added through Sanity CMS.</p>
            <Link href="/studio" className="btn btn-primary">
              Go to Sanity Studio →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
