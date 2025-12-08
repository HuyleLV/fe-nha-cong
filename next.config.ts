// next.config.ts
import type { NextConfig } from 'next';
import path from 'path';

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
    // Tắt Image Optimization để tránh lỗi 400 khi proxy/nginx không pass được `/_next/image`
    // Trang vẫn hoạt động bằng <img/> thông thường. Bật lại khi hạ tầng đã cấu hình đúng.
    unoptimized: true,
  },

  // SWC compiler
  compiler: {
    removeConsole: isProd ? { exclude: ['error'] } : false,
  },

  // When multiple lockfiles exist in a workspace, Next may infer the wrong root.
  // Set outputFileTracingRoot to explicitly tell Next where the workspace root is.
  // Here we point it to this app folder so Next treats `fe-nha-cong` as the root.
  outputFileTracingRoot: path.join(__dirname),

  // Không fail build vì ESLint/TS
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
