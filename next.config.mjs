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
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            // Prevent this site from being embedded in an iframe (clickjacking)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // Prevent MIME-type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Control how much referrer info is sent to third parties
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Restrict access to browser features
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
          },
          {
            // Force HTTPS for 1 year; include subdomains
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
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
