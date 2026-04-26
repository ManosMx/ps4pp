import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/app",
  reactCompiler: true,
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
