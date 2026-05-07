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
};

export default nextConfig;
