import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "pub-9a21083a3cc641c396e6a1093d028afd.r2.dev" }],
  },
};

export default nextConfig;
