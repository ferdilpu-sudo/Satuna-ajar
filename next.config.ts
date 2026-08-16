import type {NextConfig} from 'next';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';

const baseConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  allowedDevOrigins: ['*.asia-east1.run.app'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // AI Studio keeps the preview dev server alive while validating a production build.
    // Keep its watcher disabled during agent edits when explicitly requested.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default function nextConfig(phase: string): NextConfig {
  return {
    ...baseConfig,
    // Next.js 15 writes both `next dev` and `next build` to `.next` by default.
    // AI Studio can run them concurrently, so isolate dev artifacts to prevent
    // routes-manifest/cache files from being deleted while the preview reads them.
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  };
}
