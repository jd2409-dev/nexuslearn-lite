/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {},
  // Explicitly set the project root for Turbopack to resolve the workspace error.
  turbopack: {
    resolve: {
      roots: ['.'],
    },
  },
};

module.exports = nextConfig;
