import { productService } from '@/domains/products/services/product.service';
import { urlFor } from '@/shared/lib/sanity';
import { notFound } from 'next/navigation';
import ProductDetails from '@/domains/products/components/ProductDetails';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);
  
  if (!product) {
    return { title: 'Product Not Found - Posh Pigeon' };
  }

  return {
    title: `${product.name} - Posh Pigeon`,
    description: product.description || `Buy ${product.name} at the best price on Posh Pigeon.`,
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

  const images: { url: string; thumbnailUrl: string }[] = [];
  
  if (product.imageUrl) {
    images.push({ url: product.imageUrl, thumbnailUrl: product.imageUrl });
  }

  // Add Sanity gallery images
  if (product.gallery) {
    product.gallery.forEach((img: any) => {
      try {
        const url = urlFor(img).width(800).height(1000).url();
        const thumbnailUrl = urlFor(img).width(100).height(125).url();
        if (url) images.push({ url, thumbnailUrl });
      } catch (e) {
        console.error('Error parsing gallery image', e);
      }
    });
  }

  // Add external gallery image links
  if (product.externalGalleryUrls) {
    product.externalGalleryUrls.forEach((url: string) => {
      if (url && !images.some(img => img.url === url)) {
        images.push({ url, thumbnailUrl: url });
      }
    });
  }

  // Add variant specific images to the details gallery
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v: any) => {
      if (v.images && Array.isArray(v.images)) {
        v.images.forEach((img: any) => {
          try {
            const url = urlFor(img).width(800).height(1000).url();
            const thumbnailUrl = urlFor(img).width(100).height(125).url();
            if (url && !images.some(img => img.url === url)) {
              images.push({ url, thumbnailUrl });
            }
          } catch (e) {
            console.error('Error parsing variant image', e);
          }
        });
      }
      if (v.externalImageUrls && Array.isArray(v.externalImageUrls)) {
        v.externalImageUrls.forEach((url: string) => {
          if (url && !images.some(img => img.url === url)) {
            images.push({ url, thumbnailUrl: url });
          }
        });
      }
    });
  }

  // Fallback if no images
  if (images.length === 0) {
    images.push({
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop'
    });
  }

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
