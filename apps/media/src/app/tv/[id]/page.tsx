import {
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
import { Container, Section } from '@vite-mf-monorepo/layouts'

import TVCastCarousel from '../../../components/CastSection/TVCastCarousel'
import TVCrew from '../../../components/Crew/TVCrew'
import TVHero from '../../../components/MediaHero/TVHero'
import TVRecommendedCarousel from '../../../components/RecommendedSection/TVRecommendedCarousel'
import TVSimilarCarousel from '../../../components/SimilarSection/TVSimilarCarousel'
import TVSynopsis from '../../../components/Synopsis/TVSynopsis'
import TVTrailersSection from '../../../components/TrailersSection/TVTrailersSection'
import { CACHE_TIME_MS } from '../../../types/media'

import type { Metadata } from 'next'

/** 24h ISR — must match CACHE_TIME_S from types/media.ts */
export const revalidate = 86400

/** Props for the TVPage route. */
interface Props {
  /** Next.js 16 dynamic route params — must be awaited. */
  params: Promise<{ id: string }>
}

/**
 * Creates a QueryClient and prefetches all data needed by the TV series detail
 * page in parallel. Returns the hydrated QueryClient.
 *
 * Sharing the QueryClient between {@link generateMetadata} and the page
 * component via this helper deduplicates the TMDB fetch — no double request.
 *
 * @param seriesId - The numeric TMDB series ID.
 */
async function getQueryClient(seriesId: number): Promise<QueryClient> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: CACHE_TIME_MS },
    },
  })

  await Promise.all([
    queryClient.prefetchQuery(
      tvSeriesDetailsOptions({ path: { series_id: seriesId } })
    ),
    queryClient.prefetchQuery(
      tvSeriesCreditsOptions({ path: { series_id: seriesId } })
    ),
    queryClient.prefetchQuery(
      tvSeriesSimilarOptions({ path: { series_id: String(seriesId) } })
    ),
    queryClient.prefetchQuery(
      tvSeriesRecommendationsOptions({ path: { series_id: seriesId } })
    ),
    queryClient.prefetchQuery(
      tvSeriesVideosOptions({ path: { series_id: seriesId } })
    ),
    queryClient.prefetchQuery(
      tvSeriesImagesOptions({ path: { series_id: seriesId } })
    ),
  ])

  return queryClient
}

/**
 * Generates dynamic metadata for a TV series detail page.
 *
 * Reuses the same QueryClient as the page component to avoid duplicate
 * TMDB API calls (Next.js deduplication + shared cache).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const seriesId = Number(id)
  const queryClient = await getQueryClient(seriesId)

  interface SeriesSummary {
    name?: string
    overview?: string
    poster_path?: string
  }
  const series = queryClient.getQueryData<SeriesSummary>(
    tvSeriesDetailsOptions({ path: { series_id: seriesId } }).queryKey
  )

  return {
    title: series?.name ? `${series.name} | TMDB` : 'TV Series | TMDB',
    description: series?.overview ?? '',
    openGraph: {
      title: series?.name ?? '',
      description: series?.overview ?? '',
      images: series?.poster_path
        ? [`https://image.tmdb.org/t/p/w500${series.poster_path}`]
        : [],
    },
  }
}

/**
 * TV series detail page — server component that prefetches all section data
 * in parallel and hydrates the TanStack Query cache.
 *
 * Section render order (matches legacy):
 * 1. TVHero — full-width, outside Container
 * 2. Synopsis — inside Container + Section
 * 3. Crew — inside Container + Section
 * 4. Photos/BackdropSection — placeholder (P-4, not built yet)
 * 5. Cast — inside Container + Section
 * 6. Trailers — inside Container + Section
 * 7. Similar — inside Container + Section
 * 8. Recommended — inside Container + Section
 */
export default async function TVPage({ params }: Props) {
  const { id } = await params
  const seriesId = Number(id)
  const queryClient = await getQueryClient(seriesId)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 1. Hero — full width, outside Container */}
      <TVHero id={seriesId} />

      {/* 2. Synopsis */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <TVSynopsis id={seriesId} />
        </Section>
      </Container>

      {/* 3. Crew */}
      <Container variant="muted">
        <Section spacing="lg" maxWidth="xl">
          <TVCrew id={seriesId} />
        </Section>
      </Container>

      {/* 4. Photos/BackdropSection — P-4, not built yet */}
      {/* <BackdropSection id={seriesId} /> */}

      {/* 5. Cast */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <TVCastCarousel id={seriesId} />
        </Section>
      </Container>

      {/* 6. Trailers */}
      <Container variant="muted">
        <Section spacing="lg" maxWidth="xl">
          <TVTrailersSection id={seriesId} />
        </Section>
      </Container>

      {/* 7. Similar */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <TVSimilarCarousel id={seriesId} />
        </Section>
      </Container>

      {/* 8. Recommended */}
      <Container variant="muted">
        <Section spacing="lg" maxWidth="xl">
          <TVRecommendedCarousel id={seriesId} />
        </Section>
      </Container>
    </HydrationBoundary>
  )
}
