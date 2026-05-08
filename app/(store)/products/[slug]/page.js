import { getProduct, getProducts, urlFor } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/features/product/ProductDetailClient';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  
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
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Prepare image URLs for client component
  const images = product.images?.map((img) => ({
    url: urlFor(img).width(600).height(600).url(),
    thumbnailUrl: urlFor(img).width(100).height(100).url(),
  })) || [];

  return (
    <ProductDetailClient
      product={{
        ...product,
        slug: product.slug?.current,
        processedImages: images,
      }}
    />
  );
}
