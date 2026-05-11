import { withSentryConfig } from '@sentry/nextjs'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  assetPrefix: '/search-static',
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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
})
