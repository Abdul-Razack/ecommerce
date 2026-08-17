import type { MetadataRoute } from 'next';
import { client } from '@/shared/lib/sanity';
import { siteUrl, BRAND } from '@/shared/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = BRAND.url;
  const now = new Date().toISOString();

  // Static public pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: siteUrl('/shop'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: siteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  // Category pages (query-param URLs are included for Google)
  const categories = ['leggings', 'nighty', 'inskirt', 'sarees'];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: siteUrl(`/shop?category=${cat}`),
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic product pages from Sanity
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await client.fetch<{ slug: string; _updatedAt: string }[]>(
      `*[_type == "product"]{ "slug": slug.current, _updatedAt }`,
    );
    productPages = (products || [])
      .filter((p) => p.slug)
      .map((p) => ({
        url: siteUrl(`/shop/${p.slug}`),
        lastModified: p._updatedAt || now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
  } catch {
    // If Sanity is unreachable (e.g. build-time sandbox), return static pages only
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
