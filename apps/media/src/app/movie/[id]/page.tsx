import {
  movieCreditsOptions,
  movieDetailsOptions,
  movieImagesOptions,
  movieRecommendationsOptions,
  movieSimilarOptions,
  movieVideosOptions,
} from '@fubar-it-co/tmdb-client'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { Container, Section } from '@vite-mf-monorepo/layouts'

import MovieCastCarousel from '../../../components/CastSection/MovieCastCarousel'
import MovieCrew from '../../../components/Crew/MovieCrew'
import MovieHero from '../../../components/MediaHero/MovieHero'
import MovieRecommendedCarousel from '../../../components/RecommendedSection/MovieRecommendedCarousel'
import MovieSimilarCarousel from '../../../components/SimilarSection/MovieSimilarCarousel'
import MovieSynopsis from '../../../components/Synopsis/MovieSynopsis'
import MovieTrailersSection from '../../../components/TrailersSection/MovieTrailersSection'
import { CACHE_TIME_MS } from '../../../types/media'

import type { Metadata } from 'next'

/** 24h ISR — must match CACHE_TIME_S from types/media.ts */
export const revalidate = 86400

/** Props for the MoviePage route. */
interface Props {
  /** Next.js 16 dynamic route params — must be awaited. */
  params: Promise<{ id: string }>
}

/**
 * Creates a QueryClient and prefetches all data needed by the movie detail
 * page in parallel. Returns the hydrated QueryClient.
 *
 * Sharing the QueryClient between {@link generateMetadata} and the page
 * component via this helper deduplicates the TMDB fetch — no double request.
 *
 * @param movieId - The numeric TMDB movie ID.
 */
async function getQueryClient(movieId: number): Promise<QueryClient> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: CACHE_TIME_MS },
    },
  })

  await Promise.all([
    queryClient.prefetchQuery(
      movieDetailsOptions({ path: { movie_id: movieId } })
    ),
    queryClient.prefetchQuery(
      movieCreditsOptions({ path: { movie_id: movieId } })
    ),
    queryClient.prefetchQuery(
      movieSimilarOptions({ path: { movie_id: movieId } })
    ),
    queryClient.prefetchQuery(
      movieRecommendationsOptions({ path: { movie_id: movieId } })
    ),
    queryClient.prefetchQuery(
      movieVideosOptions({ path: { movie_id: movieId } })
    ),
    queryClient.prefetchQuery(
      movieImagesOptions({ path: { movie_id: movieId } })
    ),
  ])

  return queryClient
}

/**
 * Generates dynamic metadata for a movie detail page.
 *
 * Reuses the same QueryClient as the page component to avoid duplicate
 * TMDB API calls (Next.js deduplication + shared cache).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const movieId = Number(id)
  const queryClient = await getQueryClient(movieId)

  interface MovieSummary {
    title?: string
    overview?: string
    poster_path?: string
  }
  const movie = queryClient.getQueryData<MovieSummary>(
    movieDetailsOptions({ path: { movie_id: movieId } }).queryKey
  )

  return {
    title: movie?.title ? `${movie.title} | TMDB` : 'Movie | TMDB',
    description: movie?.overview ?? '',
    openGraph: {
      title: movie?.title ?? '',
      description: movie?.overview ?? '',
      images: movie?.poster_path
        ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
        : [],
    },
  }
}

/**
 * Movie detail page — server component that prefetches all section data
 * in parallel and hydrates the TanStack Query cache.
 *
 * Section render order (matches legacy):
 * 1. MovieHero — full-width, outside Container
 * 2. Synopsis — inside Container + Section
 * 3. Crew — inside Container + Section
 * 4. Photos/BackdropSection — placeholder (P-4, not built yet)
 * 5. Cast — inside Container + Section
 * 6. Trailers — inside Container + Section
 * 7. Similar — inside Container + Section
 * 8. Recommended — inside Container + Section
 */
export default async function MoviePage({ params }: Props) {
  const { id } = await params
  const movieId = Number(id)
  const queryClient = await getQueryClient(movieId)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* 1. Hero — full width, outside Container */}
      <MovieHero id={movieId} />

      {/* 2. Synopsis */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <MovieSynopsis id={movieId} />
        </Section>
      </Container>

      {/* 3. Crew */}
      <Container variant="muted">
        <Section spacing="lg" maxWidth="xl">
          <MovieCrew id={movieId} />
        </Section>
      </Container>

      {/* 4. Photos/BackdropSection — P-4, not built yet */}
      {/* <BackdropSection id={movieId} /> */}

      {/* 5. Cast */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <MovieCastCarousel id={movieId} />
        </Section>
      </Container>

      {/* 6. Trailers */}
      <Container variant="muted">
        <Section spacing="lg" maxWidth="xl">
          <MovieTrailersSection id={movieId} />
        </Section>
      </Container>

      {/* 7. Similar */}
      <Container variant="default">
        <Section spacing="lg" maxWidth="xl">
          <MovieSimilarCarousel id={movieId} />
        </Section>
      </Container>

      {/* 8. Recommended */}
      <Container variant="muted">
        <Section spacing="lg" maxWidth="xl">
          <MovieRecommendedCarousel id={movieId} />
        </Section>
      </Container>
    </HydrationBoundary>
  )
}
