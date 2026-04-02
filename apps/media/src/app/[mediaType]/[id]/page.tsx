import {
  movieCreditsOptions,
  movieDetailsOptions,
  movieImagesOptions,
  movieRecommendationsOptions,
  movieSimilarOptions,
  movieVideosOptions,
  tvSeriesCreditsOptions,
  tvSeriesDetailsOptions,
  tvSeriesImagesOptions,
  tvSeriesRecommendationsOptions,
  tvSeriesSimilarOptions,
  tvSeriesVideosOptions,
} from '@fubar-it-co/tmdb-client'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { notFound } from 'next/navigation'

import Cast from '@/components/Cast'
import MediaHero from '@/components/MediaHero'
import Photos from '@/components/Photos'
import { RecommendedSection } from '@/components/RecommendedSection'
import { SimilarSection } from '@/components/SimilarSection'
import Synopsis from '@/components/Synopsis'
import TrailersSection from '@/components/TrailersSection'
import { getBlurDataURL } from '@/lib/blur'
import { CACHE_TIME_MS } from '@/types/media'

import type { MediaType } from '@/types/media'
import type { Metadata } from 'next'

/** 24h ISR — must match CACHE_TIME_S from types/media.ts */
export const revalidate = 86400

/** Valid media types for this route. */
const VALID_MEDIA_TYPES = new Set<MediaType>(['movie', 'tv'])

/** Props for the media detail page route. */
interface Props {
  /** Next.js 16 dynamic route params — must be awaited. */
  params: Promise<{ mediaType: string; id: string }>
}

/**
 * Creates a QueryClient and prefetches all data needed by the media detail
 * page in parallel. Returns the hydrated QueryClient.
 *
 * Sharing the QueryClient between {@link generateMetadata} and the page
 * component via this helper deduplicates the TMDB fetch — no double request.
 */
async function createPrefetchedQueryClient(
  mediaType: MediaType,
  contentId: number
): Promise<QueryClient> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: CACHE_TIME_MS },
    },
  })

  if (mediaType === 'movie') {
    const path = { movie_id: contentId }
    await Promise.all([
      queryClient.prefetchQuery(movieDetailsOptions({ path })),
      queryClient.prefetchQuery(movieCreditsOptions({ path })),
      queryClient.prefetchQuery(movieSimilarOptions({ path })),
      queryClient.prefetchQuery(movieRecommendationsOptions({ path })),
      queryClient.prefetchQuery(movieVideosOptions({ path })),
      queryClient.prefetchQuery(movieImagesOptions({ path })),
    ])
  } else {
    const path = { series_id: contentId }
    await Promise.all([
      queryClient.prefetchQuery(tvSeriesDetailsOptions({ path })),
      queryClient.prefetchQuery(tvSeriesCreditsOptions({ path })),
      queryClient.prefetchQuery(
        tvSeriesSimilarOptions({ path: { series_id: String(contentId) } })
      ),
      queryClient.prefetchQuery(tvSeriesRecommendationsOptions({ path })),
      queryClient.prefetchQuery(tvSeriesVideosOptions({ path })),
      queryClient.prefetchQuery(tvSeriesImagesOptions({ path })),
    ])
  }

  return queryClient
}

/** Generates dynamic metadata for the media detail page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mediaType: rawMediaType, id } = await params
  const mediaType = rawMediaType as MediaType

  if (!VALID_MEDIA_TYPES.has(mediaType)) return { title: 'Not Found | TMDB' }

  const contentId = Number(id)
  const queryClient = await createPrefetchedQueryClient(mediaType, contentId)

  interface MediaSummary {
    title?: string
    name?: string
    overview?: string
    poster_path?: string
  }

  const detailsOptions =
    mediaType === 'movie'
      ? movieDetailsOptions({ path: { movie_id: contentId } })
      : tvSeriesDetailsOptions({ path: { series_id: contentId } })

  const media = queryClient.getQueryData<MediaSummary>(detailsOptions.queryKey)
  const displayTitle = media?.title ?? media?.name
  const label = mediaType === 'movie' ? 'Movie' : 'TV Series'

  return {
    title: displayTitle ? `${displayTitle} | TMDB` : `${label} | TMDB`,
    description: media?.overview ?? '',
    openGraph: {
      title: displayTitle ?? '',
      description: media?.overview ?? '',
      images: media?.poster_path
        ? [`https://image.tmdb.org/t/p/w500${media.poster_path}`]
        : [],
    },
  }
}

/**
 * Media detail page — server component that prefetches all section data
 * in parallel and hydrates the TanStack Query cache.
 *
 * Handles both `/movie/[id]` and `/tv/[id]` via the `[mediaType]` segment.
 *
 * Section render order (matches legacy):
 * 1. MediaHero — full-width, outside Container (includes crew text)
 * 2. Synopsis — owns Container + Section
 * 3. Photos — owns Container + Section
 * 4. Cast — owns Container + Section
 * 5. Trailers — owns Container + Section
 * 6. Similar — owns Container + Section
 * 7. Recommended — owns Container + Section
 */
export default async function MediaPage({ params }: Readonly<Props>) {
  const { mediaType: rawMediaType, id } = await params
  const mediaType = rawMediaType as MediaType

  if (!VALID_MEDIA_TYPES.has(mediaType)) notFound()

  const contentId = Number(id)
  const queryClient = await createPrefetchedQueryClient(mediaType, contentId)

  // Generate blur placeholder for the hero backdrop image
  interface MediaSummaryForBlur {
    backdrop_path?: string | null
  }

  const detailsOpts =
    mediaType === 'movie'
      ? movieDetailsOptions({ path: { movie_id: contentId } })
      : tvSeriesDetailsOptions({ path: { series_id: contentId } })

  const mediaData = queryClient.getQueryData<MediaSummaryForBlur>(
    detailsOpts.queryKey
  )
  const heroBlurDataURL = mediaData?.backdrop_path
    ? await getBlurDataURL(mediaData.backdrop_path)
    : undefined

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 1. Hero — full width, outside Container */}
      <MediaHero
        id={contentId}
        mediaType={mediaType}
        heroBlurDataURL={heroBlurDataURL}
      />

      {/* 2. Synopsis */}
      <Synopsis id={contentId} mediaType={mediaType} />

      {/* 3. Photos */}
      <Photos id={contentId} mediaType={mediaType} />

      {/* 4. Cast */}
      <Cast id={contentId} mediaType={mediaType} />

      {/* 5. Trailers */}
      <TrailersSection id={contentId} mediaType={mediaType} />

      {/* 6. Similar */}
      <SimilarSection id={contentId} mediaType={mediaType} />

      {/* 7. Recommended */}
      <RecommendedSection id={contentId} mediaType={mediaType} />
    </HydrationBoundary>
  )
}
