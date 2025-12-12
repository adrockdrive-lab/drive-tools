import type { NextConfig } from "next";

// 번들 분석기 설정
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // 번들 분석 및 최적화
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 프로덕션에서 번들 분석 활성화
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            enforce: true,
          },
          animations: {
            test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
            name: 'animations',
            priority: 20,
            enforce: true,
          },
          ui: {
            test: /[\\/]node_modules[\\/](@radix-ui|lucide-react)[\\/]/,
            name: 'ui-components',
            priority: 15,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: 5,
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // 이미지 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 실험적 기능 활성화
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      '@radix-ui/react-icons',
      'lucide-react',
      'sonner',
    ],
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 압축 및 성능
  compress: true,
  poweredByHeader: false,

  // 정적 생성 최적화
  output: 'standalone',
};

export default withBundleAnalyzer(nextConfig);
