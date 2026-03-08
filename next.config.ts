import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: true, // Temporarily disabled for production build on VPS
  register: true,
  scope: "/",
  sw: "service-worker.js",
  workboxOptions: {
    runtimeCaching: [
      // API Routes (NetworkFirst - try fresh, fallback to cache)
      {
        urlPattern: /^https?.+\/api\/(estates|allocations|customers).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          },
          networkTimeoutSeconds: 10,
        },
      },
      // Static Assets (CacheFirst)
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "wvhnuiajtvoajjhumzxe.supabase.co",
      },
    ],
  },
  // Skip TypeScript errors during build (we run tsc separately in CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Headers configuration moved to middleware for dynamic CORS handling
  webpack: (config, { isServer }) => {
    // Exclude supabase functions (Deno code) from Next.js build
    config.externals = config.externals || [];
    config.externals.push({
      'supabase/functions': 'commonjs supabase/functions',
    });

    // Ignore supabase directory entirely
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /supabase\/functions/,
      loader: 'ignore-loader',
    });

    return config;
  },
};

export default withPWA(nextConfig);
