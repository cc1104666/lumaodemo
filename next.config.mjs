/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true,
  },
  // Cloudflare Pages 配置
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
}

export default nextConfig
