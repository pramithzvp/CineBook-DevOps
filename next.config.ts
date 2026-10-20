import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" as const } : {}),
  async rewrites() {
    return process.env.DOCKER_BUILD === "true"
      ? [{ source: "/api/:path*", destination: "http://backend:8080/api/:path*" }]
      : [];
  },
};

export default nextConfig;
