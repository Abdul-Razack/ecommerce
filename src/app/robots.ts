import type { MetadataRoute } from 'next';
import { BRAND } from '@/shared/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/studio',
          '/studio/*',
          '/api',
          '/api/*',
          '/account',
          '/account/*',
          '/cart',
          '/checkout',
          '/checkout/*',
          '/orders',
          '/orders/*',
          '/callback',
          '/callback/*',
        ],
      },
      // Allow AI crawlers to access public pages for GEO/AEO
      {
        userAgent: ['GPTBot', 'Google-Extended', 'ClaudeBot', 'PerplexityBot', 'Bytespider'],
        allow: '/',
        disallow: [
          '/admin',
          '/admin/*',
          '/api',
          '/api/*',
          '/studio',
        ],
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}
