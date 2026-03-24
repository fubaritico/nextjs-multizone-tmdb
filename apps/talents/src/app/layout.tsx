import { RootLayout } from '@vite-mf-monorepo/layouts/next'

import QueryProvider from '../providers/QueryProvider'

import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TMDB — Talents',
  description: 'Actor and director profiles, filmography, and photos.',
}

export default function TalentsLayout({
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
