'use client'

import { Badge, Rating, Skeleton, Typography } from '@vite-mf-monorepo/ui'
import { HeroImage } from '@vite-mf-monorepo/ui/next'
import clsx from 'clsx'

import { useMediaDetails } from '@/hooks'
import { formatRuntime, isMovie } from '@/utils'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Props for {@link MediaHero}. */
interface MediaHeroProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
}

/**
 * Full-width hero banner with backdrop image, title, metadata, and genre badges.
 *
 * Unified component handling both Movie and TV series details via the
 * `mediaType` prop and the {@link isMovie} type guard.
 */
const MediaHero: FC<MediaHeroProps> = ({ id, mediaType }) => {
  const { data: media, isLoading, error } = useMediaDetails(mediaType, id)

  if (isLoading) {
    return (
      <Skeleton
        variant="rectangle"
        className="mda:w-full mda:hero-height"
        aspectRatio="21/9"
        rounded={false}
      />
    )
  }

  if (error ?? !media) {
    return (
      <div className="mda:flex mda:h-[400px] mda:w-full mda:items-center mda:justify-center mda:bg-muted">
        <Typography variant="body" className="mda:text-destructive">
          Failed to load media details
        </Typography>
      </div>
    )
  }

  const title = isMovie(media) ? media.title : media.name
  const releaseDate = isMovie(media) ? media.release_date : media.first_air_date
  const runtime = isMovie(media) ? media.runtime : undefined
  const numberOfSeasons = isMovie(media)
    ? undefined
    : (media as { number_of_seasons?: number }).number_of_seasons
  const numberOfEpisodes = isMovie(media)
    ? undefined
    : (media as { number_of_episodes?: number }).number_of_episodes

  const releaseYear = releaseDate
    ? new Date(releaseDate).getFullYear().toString()
    : undefined
  const genreNames = media.genres?.map((g) => g.name ?? '') ?? []

  return (
    <div className="mda:relative mda:w-full">
      {/* Backdrop Image */}
      <div className="mda:relative mda:aspect-[21/9] mda:lg:max-h-[440px] mda:w-full mda:overflow-hidden">
        <HeroImage backdropPath={media.backdrop_path} />

        {/* Gradient Overlay */}
        <div className="mda:absolute mda:inset-0 mda:bg-gradient-to-t mda:from-black/80 mda:via-black/40 mda:to-transparent mda:z-1 mda:top-0 mda:left-0 mda:right-0 mda:bottom-0" />

        {/* Content Overlay */}
        <div
          className={clsx(
            'mda:absolute mda:left-1/2 mda:-translate-x-1/2 mda:z-2 mda:w-full mda:max-w-screen-xl',
            'mda:px-4 mda:sm:px-5 mda:md:px-5 mda:lg:px-5',
            'mda:bottom-4 mda:sm:bottom-5 mda:md:bottom-6 mda:lg:bottom-8',
            'mda:flex mda:justify-start mda:items-end'
          )}
        >
          <div className="mda:flex mda:flex-col mda:w-full">
            {/* Title */}
            <Typography
              variant="h1"
              className="mda:mb-1 mda:sm:mb-2 mda:text-white! mda:text-shadow-medium"
            >
              {title}
            </Typography>

            {/* Tagline */}
            {media.tagline && (
              <Typography
                variant="lead"
                className="mda:mb-2 mda:sm:mb-3 mda:md:mb-4 mda:italic mda:text-white! mda:opacity-90 mda:text-shadow-strong"
              >
                {media.tagline}
              </Typography>
            )}

            {/* Metadata */}
            <div className="mda:mb-2 mda:sm:mb-3 mda:md:mb-4 mda:flex mda:items-center mda:gap-2 mda:text-white!">
              {releaseYear && (
                <Typography
                  as="span"
                  variant="body"
                  className="mda:text-white! mda:text-shadow-strong"
                >
                  {releaseYear}
                </Typography>
              )}
              {runtime && (
                <>
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    •
                  </Typography>
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    {formatRuntime(runtime)}
                  </Typography>
                </>
              )}
              {numberOfSeasons && (
                <>
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    •
                  </Typography>
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    {numberOfSeasons} Season{numberOfSeasons > 1 ? 's' : ''}
                  </Typography>
                </>
              )}
              {numberOfEpisodes && (
                <>
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    •
                  </Typography>
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    {numberOfEpisodes} Episode{numberOfEpisodes > 1 ? 's' : ''}
                  </Typography>
                </>
              )}
              {media.vote_average !== undefined && (
                <>
                  <Typography
                    as="span"
                    variant="body"
                    className="mda:text-white! mda:text-shadow-strong"
                  >
                    •
                  </Typography>
                  <Rating
                    value={media.vote_average}
                    size="sm"
                    variant="circle"
                  />
                </>
              )}
            </div>

            {/* Genres */}
            {genreNames.length > 0 && (
              <div className="mda:flex mda:flex-wrap mda:gap-2">
                {genreNames.map((genre) => (
                  <Badge key={genre} variant="secondary" size="sm">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MediaHero
