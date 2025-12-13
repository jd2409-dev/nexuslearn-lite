import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // This is the fix for the turbopack root issue.
  // It tells turbopack that the project root is the current directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
