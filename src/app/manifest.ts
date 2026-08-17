import type { MetadataRoute } from 'next';
import { BRAND, siteUrl } from '@/shared/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: 'PoshPigeon',
    description: BRAND.metaDescription,
    start_url: siteUrl('/'),
    display: 'standalone',
    background_color: '#F8F6F4',
    theme_color: '#1C1917',
    orientation: 'portrait-primary',
    icons: [
      { src: '/images/logo.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/logo.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
