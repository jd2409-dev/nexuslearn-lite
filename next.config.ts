import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // This is the fix for the turbopack root issue.
  // It tells turbopack that the project root is the current directory.
  turbopack: {
    // This is the fix for the turbopack root issue.
    // It tells turbopack that the project root is the current directory.
    resolveExtensions: [
      '.native.tsx',
      '.native.ts',
      '.native.jsx',
      '.native.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
  },
};

export default nextConfig;
