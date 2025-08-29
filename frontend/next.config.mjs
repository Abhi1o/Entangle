/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure proper output for Vercel
  output: 'standalone',
  
  transpilePackages: [
    "@getpara/react-sdk",
    "@getpara/react-components", 
    "@getpara/web-sdk",
    "@getpara/core-sdk"
  ],
  webpack: (config, { isServer }) => {
    // Fix for Para SDK Stencil components
    config.externals = config.externals || [];
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Add fallbacks for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Handle ES modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false,
      },
    });

    // Performance optimizations
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },
  // Disable strict mode temporarily to avoid double mounting issues
  reactStrictMode: false,
  
  // Handle route groups properly
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Enable app directory features
    appDir: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Enable app directory features
    appDir: true,
  },
  
  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Suppress hydration warnings in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

export default nextConfig
