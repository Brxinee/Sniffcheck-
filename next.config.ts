import type { NextConfig } from "next";
const nextConfig: NextConfig = { experimental: { serverActions: { bodySizeLimit: "8mb" } }, images: { remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }] } };
export default nextConfig;
