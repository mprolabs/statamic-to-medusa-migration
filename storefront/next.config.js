/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['demo.saleor.io', 'saleor-media.s3.amazonaws.com'], // Add your media domains here
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 