'use client'

import { movieImagesOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Skeleton, Typography } from '@vite-mf-monorepo/ui'
import Image from 'next/image'
import Link from 'next/link'

import type { MovieImagesResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'
import type { FC } from 'react'

/** Maximum number of backdrop images to display in the grid. */
const MAX_BACKDROPS = 4

/** Base TMDB image URL for backdrop images. */
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w780'

/** Props for {@link MovieBackdropSection}. */
interface MovieBackdropSectionProps {
  /** TMDB movie ID. */
  id: number
}

/**
 * Displays a bento-grid of up to 4 backdrop images for a given movie.
 *
 * Each image links to the photo viewer at `/movie/{id}/photos/{index}`.
 * The first image spans 2 columns and 2 rows on desktop for visual emphasis.
 *
 * Returns `null` when there are no backdrops or when the request fails
 * (graceful degradation — section simply does not render).
 *
 * This is a Client Component because it calls `useQuery`.
 *
 * @param id - TMDB movie ID used to fetch images.
 */
const MovieBackdropSection: FC<MovieBackdropSectionProps> = ({ id }) => {
  const { data, isLoading, error } = useQuery(
    movieImagesOptions({ path: { movie_id: id } })
  ) as UseQueryResult<MovieImagesResponse>

  if (isLoading) {
    return (
      <section data-testid="photos">
        <Typography variant="h2" className="mda:mb-4">
          Photos
        </Typography>
        <div className="mda:grid mda:grid-cols-2 md:mda:grid-cols-4 md:mda:grid-rows-2 md:mda:h-72 mda:gap-2">
          {Array.from({ length: MAX_BACKDROPS }).map((_, index) => (
            <Skeleton
              key={index}
              className={
                index === 0
                  ? 'mda:col-span-2 md:mda:row-span-2 mda:aspect-video'
                  : 'mda:aspect-video'
              }
            />
          ))}
        </div>
      </section>
    )
  }

  if (error ?? !data) return null

  const backdrops = data.backdrops?.slice(0, MAX_BACKDROPS) ?? []

  if (backdrops.length === 0) return null

  return (
    <section data-testid="photos">
      <Typography variant="h2" className="mda:mb-4">
        Photos
      </Typography>
      <div className="mda:grid mda:grid-cols-2 md:mda:grid-cols-4 md:mda:grid-rows-2 md:mda:h-72 mda:gap-2">
        {backdrops.map((backdrop, index) => (
          <Link
            key={backdrop.file_path ?? index}
            href={`/movie/${String(id)}/photos/${String(index)}`}
            className={
              index === 0
                ? 'mda:col-span-2 md:mda:row-span-2 mda:relative mda:block mda:aspect-video mda:overflow-hidden md:mda:aspect-auto'
                : 'mda:relative mda:block mda:aspect-video mda:overflow-hidden md:mda:aspect-auto'
            }
          >
            <Image
              src={`${TMDB_BACKDROP_BASE}${backdrop.file_path ?? ''}`}
              alt={`Movie photo ${String(index + 1)}`}
              fill
              className="mda:object-cover"
              sizes={
                index === 0
                  ? '(max-width: 768px) 50vw, 50vw'
                  : '(max-width: 768px) 50vw, 25vw'
              }
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default MovieBackdropSection
