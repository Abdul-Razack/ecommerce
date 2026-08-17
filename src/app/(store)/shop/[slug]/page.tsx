import { productService } from '@/domains/products/services/product.service';
import { urlFor } from '@/shared/lib/sanity';
import { notFound } from 'next/navigation';
import ProductDetails from '@/domains/products/components/ProductDetails';
import JsonLd from '@/shared/ui/JsonLd';
import { productSchema, breadcrumbSchema, faqSchema, categoryFaqs, siteUrl, BRAND } from '@/shared/lib/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await productService.getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      robots: { index: false },
    };
  }

  const title = product.seo?.metaTitle || `${product.name} — Premium ${product.category || 'Apparel'} | Posh Pigeon`;
  const description =
    product.seo?.metaDescription ||
    product.description ||
    `Buy ${product.name} at the best price on Posh Pigeon. Premium ${product.category || 'women\'s apparel'}. Free shipping on orders above ₹999.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      `buy ${product.name}`,
      `${product.category} online`,
      'Posh Pigeon',
      'premium women apparel India',
    ],
    alternates: { canonical: siteUrl(`/shop/${slug}`) },
    openGraph: {
      title,
      description,
      url: siteUrl(`/shop/${slug}`),
      type: 'website',
      images: product.imageUrl
        ? [{ url: product.imageUrl, width: 800, height: 1000, alt: product.name }]
        : [{ url: BRAND.ogImage, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [BRAND.ogImage],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
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

  // JSON-LD structured data
  const breadcrumbItems = [
    { name: 'Home', url: siteUrl('/') },
    { name: 'Shop', url: siteUrl('/shop') },
  ];
  if (product.category) {
    breadcrumbItems.push({
      name: product.category,
      url: siteUrl(`/shop?category=${product.category.toLowerCase()}`),
    });
  }
  breadcrumbItems.push({ name: product.name, url: siteUrl(`/shop/${product.slug}`) });

  // Category-specific FAQ for AEO
  const categorySlug = product.category?.toLowerCase().replace(/\s+/g, '') || '';
  const categoryFaqKey = Object.keys(categoryFaqs).find(
    (k) => k === categorySlug || categorySlug.includes(k),
  );
  const faqItems = categoryFaqKey ? categoryFaqs[categoryFaqKey] : [];

  return (
    <>
      <JsonLd data={productSchema({
        name: product.name,
        description: product.description || undefined,
        slug: product.slug,
        imageUrl: product.imageUrl,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        category: product.category,
        variants: product.variants?.map((v: any) => ({
          color: v.color,
          size: v.size,
          price: v.price,
          stock: v.stock,
        })),
      })} />
      <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
      {faqItems.length > 0 && <JsonLd data={faqSchema(faqItems)} />}

      <ProductDetails
        product={{
          ...product,
          slug: product.slug?.current || product.slug,
          processedImages: images,
        }}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
