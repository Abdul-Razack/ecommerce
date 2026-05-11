/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  // Allow Sanity Studio to work
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/shop',
        permanent: true,
      },
      {
        source: '/products/:slug*',
        destination: '/shop/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
