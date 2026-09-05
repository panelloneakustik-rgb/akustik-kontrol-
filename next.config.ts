import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.akustikkontrol.com.tr" },
    ],
  },
};

export default nextConfig;
