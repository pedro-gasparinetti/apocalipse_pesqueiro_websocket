/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure images to allow external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Configure output for better compatibility
  output: 'standalone',
  // Disable experimental features that might cause issues
  experimental: {
    disableOptimizedLoading: true,
    // Disable webpack build worker that might cause permission issues
    webpackBuildWorker: false
  },
  // Configure tracing
  trailingSlash: false,
  // Disable source maps in development to avoid file permission issues
  productionBrowserSourceMaps: false,
  // Configure webpack to avoid file system issues
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Disable file system caching in development
      config.cache = false;
    }
    return config;
  }
};

export default nextConfig;
