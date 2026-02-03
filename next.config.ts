import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.escapeplan.com', // Hypothetical CDN from API docs context
      },
      {
         protocol: 'https',
         hostname: '**', // Allow all for prototype convenience if needed, or stick to strict
      }
    ],
  },
};

export default nextConfig;