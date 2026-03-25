'use client'

import { Tabs, Typography } from '@vite-mf-monorepo/ui'
import { useState } from 'react'

import { DEFAULT_POPULAR_MEDIA_TYPE } from '../../types/home'

import PopularMovieCarousel from './PopularMovieCarousel'
import PopularTVCarousel from './PopularTVCarousel'

import type { MediaType } from '../../types/home'
import type { FC } from 'react'

/**
 * Props for the PopularSection component.
 */
interface PopularSectionProps {
  /** The media type to display on initial render. Defaults to DEFAULT_POPULAR_MEDIA_TYPE. */
  initialMediaType?: MediaType
}

/**
 * PopularSection renders the "What's Popular" section on the home page.
 *
 * Manages tab state between Movies and TV Shows. Each tab renders the
 * corresponding carousel component which fetches data via useQuery.
 *
 * @example
 * <PopularSection initialMediaType="movie" />
 */
const PopularSection: FC<PopularSectionProps> = ({
  initialMediaType = DEFAULT_POPULAR_MEDIA_TYPE,
}) => {
  const [mediaType, setMediaType] = useState<MediaType>(initialMediaType)

  return (
    <div className="hm:flex hm:flex-col hm:gap-4">
      <Typography variant="h2">{"What's Popular"}</Typography>
      <Tabs
        value={mediaType}
        onValueChange={(v) => {
          setMediaType(v as MediaType)
        }}
        variant="pills"
        prefix="popular"
      >
        <Tabs.List>
          <Tabs.Trigger value="movie">Movies</Tabs.Trigger>
          <Tabs.Trigger value="tv">TV Shows</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="movie">
          <PopularMovieCarousel />
        </Tabs.Panel>
        <Tabs.Panel value="tv">
          <PopularTVCarousel />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default PopularSection
