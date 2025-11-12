import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
    optimizeCss: true,
  },
  eslint: {
    dirs: ["app", "components", "lib"],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
