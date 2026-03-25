'use client'

import { Tabs, Typography } from '@vite-mf-monorepo/ui'
import { useState } from 'react'

import { DEFAULT_FREE_TO_WATCH_MEDIA_TYPE } from '../../types/home'

import FreeToWatchMovieCarousel from './FreeToWatchMovieCarousel'
import FreeToWatchTVCarousel from './FreeToWatchTVCarousel'

import type { MediaType } from '../../types/home'
import type { FC } from 'react'

/**
 * Props for {@link FreeToWatchSection}.
 */
interface FreeToWatchSectionProps {
  /**
   * The media type to show on initial render.
   * Provided by the Server Component parent to ensure correct SSR hydration.
   * Defaults to {@link DEFAULT_FREE_TO_WATCH_MEDIA_TYPE}.
   */
  initialMediaType?: MediaType
}

/**
 * Section displaying free-to-watch content (movies and TV shows) using the
 * TMDB discover endpoint filtered by `with_watch_monetization_types: 'free'`.
 *
 * Manages tab state (movie / tv) client-side. Delegates data fetching to
 * {@link FreeToWatchMovieCarousel} and {@link FreeToWatchTVCarousel}.
 */
const FreeToWatchSection: FC<FreeToWatchSectionProps> = ({
  initialMediaType = DEFAULT_FREE_TO_WATCH_MEDIA_TYPE,
}) => {
  const [mediaType, setMediaType] = useState<MediaType>(initialMediaType)

  return (
    <div className="hm:flex hm:flex-col hm:gap-4">
      <Typography variant="h2">Free To Watch</Typography>
      <Tabs
        value={mediaType}
        onValueChange={(v) => {
          setMediaType(v as MediaType)
        }}
        variant="pills"
        prefix="free"
      >
        <Tabs.List>
          <Tabs.Trigger value="movie">Movies</Tabs.Trigger>
          <Tabs.Trigger value="tv">TV Shows</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="movie">
          <FreeToWatchMovieCarousel />
        </Tabs.Panel>
        <Tabs.Panel value="tv">
          <FreeToWatchTVCarousel />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default FreeToWatchSection
