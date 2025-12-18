/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {},
  // Explicitly set the project root for Turbopack to resolve the workspace error.
  turbopack: {
    // The correct option is `projectDir`, which sets the root directory for Turbopack.
    projectDir: __dirname,
  },
};

module.exports = nextConfig;
