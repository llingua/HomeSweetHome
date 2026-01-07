/** @type {import('next').NextConfig} */
const isAddon = process.env.ADDON === 'true' || process.env.ADDON === '1';

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    useWasmBinary: true,
  },
  assetPrefix: isAddon ? './' : undefined,
};

export default nextConfig;
