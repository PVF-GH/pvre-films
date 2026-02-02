import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wgqlwxbhadfqadaaxbcn.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
    // Allow data URLs for uploaded images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    unoptimized: true, // Allow base64 data URLs
  },
  eslint: {
    // Allow builds to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow builds to succeed even with TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
