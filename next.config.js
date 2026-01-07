/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    useWasmBinary: true,
  },
  assetPrefix: process.env.NEXT_ASSET_PREFIX || undefined,
};

export default nextConfig;
