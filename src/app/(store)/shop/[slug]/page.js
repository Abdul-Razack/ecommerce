import { productService } from '@/domains/products/services/product.service';
import { urlFor } from '@/shared/lib/sanity';
import { notFound } from 'next/navigation';
import ProductDetails from '@/domains/products/components/ProductDetails';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found - Energy' };
  }

  return {
    title: `${product.name} - Energy`,
    description: product.description || `Buy ${product.name} at the best price on Energy.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products using the service layer
  let relatedProducts = await productService.getRelatedProducts(product.category, product._id);
  
  if (!relatedProducts || relatedProducts.length === 0) {
    const featured = await productService.getFeaturedProducts();
    relatedProducts = featured.filter(p => p._id !== product._id).slice(0, 4);
  }

  // Prepare image URLs for client component using shared sanity lib
  const images = product.gallery?.map((img) => ({
    url: urlFor(img).width(800).height(1000).url(), // 4:5 ratio
    thumbnailUrl: urlFor(img).width(100).height(125).url(),
  })) || [];

  return (
    <ProductDetails
      product={{
        ...product,
        slug: product.slug?.current,
        processedImages: images,
      }}
      relatedProducts={relatedProducts}
    />
  );
}
