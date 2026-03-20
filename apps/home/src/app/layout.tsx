import { RootLayout } from '@vite-mf-monorepo/layouts/next'

import QueryProvider from '../providers/QueryProvider'

import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TMDB — Home',
  description: 'Trending movies, popular TV shows, and more.',
}

export default function HomeLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <RootLayout>{children}</RootLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
