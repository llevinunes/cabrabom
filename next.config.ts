import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Search URLs carry the client's name and details; never send them to other sites (wa.me included).
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Referrer-Policy", value: "same-origin" }] }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
