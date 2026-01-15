import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Configure Turbopack for path aliases (use relative path)
  turbopack: {
    resolveAlias: {
      '#site/content': '../../.velite/content.ts',
    },
  },
  // Fallback webpack config for non-turbopack builds
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '#site/content': path.resolve(__dirname, '../../.velite/content.ts'),
    };
    return config;
  },
};

export default nextConfig;
