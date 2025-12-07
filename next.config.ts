import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "r2.beer-link.com",
      },
      {
        protocol: "https",
        hostname: "pub-14a53d66f8944bc6b7fd7bd004e750a6.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-cdb979a7c5384512a98ac2106b339f21.r2.dev",
      },
    ],
  },
};

export default nextConfig;
