import { Typography } from '@vite-mf-monorepo/ui'

import type { Metadata } from 'next'
import type { ComponentType } from 'react'

export const metadata: Metadata = {
  title: 'TMDB — Search',
  description: 'Search and discover movies, TV shows, and more.',
}

// Cross-package React type boundary — cast to local ComponentType to resolve
// dual @types/react instance conflict between shared UI package and zone app.
const Typo = Typography as ComponentType<{
  variant: string
  children: React.ReactNode
}>

/**
 * Search page placeholder. Will be replaced with full search implementation.
 */
export default function SearchPage() {
  return (
    <div className="sr:flex sr:items-center sr:justify-center sr:py-20">
      <Typo variant="h1">Search — Coming Soon</Typo>
    </div>
  )
}
