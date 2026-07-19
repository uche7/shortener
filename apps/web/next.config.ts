import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicit workspace root: the lockfile lives at the monorepo root.
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
