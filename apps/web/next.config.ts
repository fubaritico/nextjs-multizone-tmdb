import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  rewrites() {
    const homeUrl = process.env.NEXT_PUBLIC_HOME_URL ?? 'http://localhost:3001'
    const mediaUrl =
      process.env.NEXT_PUBLIC_MEDIA_URL ?? 'http://localhost:3002'
    const talentsUrl =
      process.env.NEXT_PUBLIC_TALENTS_URL ?? 'http://localhost:3003'
    const searchUrl =
      process.env.NEXT_PUBLIC_SEARCH_URL ?? 'http://localhost:3004'

    return {
      fallback: [
        { source: '/', destination: `${homeUrl}/` },
        {
          source: '/movie/:id/:path*',
          destination: `${mediaUrl}/movie/:id/:path*`,
        },
        { source: '/tv/:id/:path*', destination: `${mediaUrl}/tv/:id/:path*` },
        {
          source: '/actor/:id/:path*',
          destination: `${talentsUrl}/actor/:id/:path*`,
        },
        {
          source: '/director/:id/:path*',
          destination: `${talentsUrl}/director/:id/:path*`,
        },
        { source: '/search/:path*', destination: `${searchUrl}/search/:path*` },
      ],
    }
  },
}

export default nextConfig
