/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },

  // Experimental features for performance
  experimental: {
    // Optimize package imports for commonly used libraries
    optimizePackageImports: ['lucide-react'],
  },

  // Compression
  compress: true,

  // Powered by header
  poweredByHeader: false,

  // Trailing slash for better SEO
  trailingSlash: false,

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
      {
        // Cache OG images for 24 hours
        source: '/rounds/:roundId/opengraph-image',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=60',
          },
        ],
      },
      {
        // Cache static assets for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Webpack config for bundle analysis
  webpack: (config, { isServer }) => {
    // Enable bundle analyzer in analyze mode
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new (require('@next/bundle-analyzer')).BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
        })
      )
    }
    return config
  },
}

export default nextConfig
