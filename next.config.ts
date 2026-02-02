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
    ],
    // Allow data URLs for uploaded images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    unoptimized: true, // Allow base64 data URLs
  },
};

export default nextConfig;
