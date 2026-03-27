'use client'

import {
  movieImagesOptions,
  tvSeriesImagesOptions,
} from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { Icon, Skeleton, Typography } from '@vite-mf-monorepo/ui'
import Image from 'next/image'
import Link from 'next/link'

import { toPhotoId } from '@/types/media'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Number of backdrop photos shown in the bento grid (excluding the CTA tile). */
const PHOTOS_IN_GRID = 4

/** Props for {@link Photos}. */
interface PhotosProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Displays a bento-grid of up to 4 backdrop images + a CTA tile for a movie or TV series.
 *
 * Each image links to the photo viewer at `/{mediaType}/{id}/photos/{photoId}`.
 * The first image spans 2 columns and 2 rows on desktop for visual emphasis.
 * The last cell shows the total photo count and links to the viewer.
 *
 * Returns `null` when there are no backdrops or when the request fails.
 */
const Photos: FC<PhotosProps> = ({ id, mediaType }) => {
  const movieQuery = useQuery({
    ...movieImagesOptions({ path: { movie_id: id } }),
    enabled: mediaType === 'movie',
  })

  const tvQuery = useQuery({
    ...tvSeriesImagesOptions({ path: { series_id: id } }),
    enabled: mediaType === 'tv',
  })

  const { data, isLoading, error } =
    mediaType === 'movie' ? movieQuery : tvQuery

  if (isLoading) {
    return (
      <section data-testid="photos">
        <Typography variant="h2" className="mda:mb-6">
          Photos
        </Typography>
        <div className="mda:grid mda:grid-cols-2 mda:md:grid-cols-4 mda:md:grid-rows-2 mda:md:h-72 mda:gap-2">
          <Skeleton
            variant="rectangle"
            width="100%"
            height="100%"
            className="mda:col-span-2 mda:aspect-video mda:md:aspect-auto mda:md:row-span-2 mda:rounded-md"
          />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangle"
              width="100%"
              height="100%"
              className="mda:aspect-video mda:md:aspect-auto mda:rounded-md"
            />
          ))}
          <div className="mda:aspect-video mda:md:aspect-auto mda:rounded-md mda:bg-muted" />
        </div>
      </section>
    )
  }

  if (error ?? !data?.backdrops?.length) return null

  const backdrops = data.backdrops ?? []
  const photos = backdrops.slice(0, PHOTOS_IN_GRID)
  const total = backdrops.length
  const basePath = `/${mediaType}/${String(id)}`

  return (
    <section data-testid="photos">
      <Typography variant="h2" className="mda:mb-6">
        Photos
      </Typography>
      <div className="mda:grid mda:grid-cols-2 mda:md:grid-cols-4 mda:md:grid-rows-2 mda:md:h-72 mda:gap-2">
        {/* Large photo — col-span-2 row-span-2 on desktop */}
        <Link
          href={`${basePath}/photos/${toPhotoId(photos[0]?.file_path ?? '')}`}
          className="mda:relative mda:col-span-2 mda:md:row-span-2 mda:aspect-video mda:md:aspect-auto mda:overflow-hidden mda:rounded-md mda:focus-visible:outline-none mda:focus-visible:ring-2 mda:focus-visible:ring-ring"
          aria-label="View photo 1"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w780${photos[0]?.file_path ?? ''}`}
            alt="Photo 1"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="mda:object-cover mda:transition-transform mda:duration-200 hover:mda:scale-105"
          />
        </Link>

        {/* Small photos 2–4 */}
        {photos.slice(1).map((photo, i) => (
          <Link
            key={photo.file_path}
            href={`${basePath}/photos/${toPhotoId(photo.file_path ?? '')}`}
            className="mda:relative mda:aspect-video mda:md:aspect-auto mda:overflow-hidden mda:rounded-md mda:focus-visible:outline-none mda:focus-visible:ring-2 mda:focus-visible:ring-ring"
            aria-label={`View photo ${String(i + 2)}`}
          >
            <Image
              src={`https://image.tmdb.org/t/p/w300${photo.file_path ?? ''}`}
              alt={`Photo ${String(i + 2)}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="mda:object-cover mda:transition-transform mda:duration-200 hover:mda:scale-105"
            />
          </Link>
        ))}

        {/* CTA tile — "X photos" */}
        <Link
          href={`${basePath}/photos/${toPhotoId(photos[0]?.file_path ?? '')}`}
          className="mda:aspect-video mda:md:aspect-auto mda:flex mda:flex-col mda:items-center mda:justify-center mda:gap-2 mda:rounded-md mda:bg-muted mda:transition-colors hover:mda:bg-muted/70 mda:focus-visible:outline-none mda:focus-visible:ring-2 mda:focus-visible:ring-ring"
          aria-label={`View all ${String(total)} photos`}
        >
          <Icon name="Photo" size={24} className="mda:text-badge-foreground" />
          <Typography
            variant="body"
            className="mda:text-badge-foreground mda:font-semibold"
          >
            {total} photos
          </Typography>
        </Link>
      </div>
    </section>
  )
}

export default Photos
