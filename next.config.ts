// next.config.ts
import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Build/runtime
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,

  // ⬇️ đặt đúng vị trí
  typedRoutes: false,

  // Fix 'critters'
  experimental: {
    optimizeCss: false,
  },

  // Ảnh từ ngoài (dev + prod)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // SWC compiler
  compiler: {
    removeConsole: isProd ? { exclude: ['error'] } : false,
  },

  // Không fail build vì ESLint/TS
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
