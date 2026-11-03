import type { NextConfig } from "next";
import { parseEnv } from "./lib/env";

// Production deploy on Vercel: a missing or wrong variable fails the build, with its name,
// instead of a green deploy that answers 500 (ADR 0042).
if (process.env.VERCEL_ENV === "production") parseEnv(process.env);

const nextConfig: NextConfig = {
  devIndicators: false,
  // Lets a phone on the local network open the dev server (http://10.0.1.x:3000) and hydrate.
  // Development only: private network ranges.
  allowedDevOrigins: ["10.*.*.*", "192.168.*.*", "172.*.*.*"],
  // Search URLs carry the client's name and details; never send them to other sites (wa.me included).
  async headers() {
    return [
      { source: "/:path*", headers: [{ key: "Referrer-Policy", value: "same-origin" }] },
      // The service worker must never be served stale: updates reach users on the next visit.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
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
