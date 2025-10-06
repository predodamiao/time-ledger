/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['graph.microsoft.com'],
  },
}

module.exports = nextConfig
