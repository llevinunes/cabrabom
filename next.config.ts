import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Lets a phone on the local network open the dev server (http://10.0.1.x:3000) and hydrate.
  // Development only: private network ranges.
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "172.*.*.*"],
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
