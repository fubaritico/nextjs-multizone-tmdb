import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  assetPrefix: '/media-static',
  env: {
    VITE_TMDB_API_TOKEN: process.env.VITE_TMDB_API_TOKEN,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
}

export default nextConfig
