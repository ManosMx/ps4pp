import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  reactCompiler: true,
  reactStrictMode: true,
  devIndicators: false,
};

export default nextConfig;
