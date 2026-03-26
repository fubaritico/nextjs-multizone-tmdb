import { RootLayout } from '@vite-mf-monorepo/layouts/next'

import QueryProvider from '../providers/QueryProvider'

import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TMDB — Media',
  description: 'Movie and TV show details, cast, crew, and photos.',
}

export default function MediaLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <RootLayout crossZoneHome>{children}</RootLayout>
        </QueryProvider>
      </body>
    </html>
  )
}
