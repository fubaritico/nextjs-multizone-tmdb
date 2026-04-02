import {
  movieImagesOptions,
  tvSeriesImagesOptions,
} from '@fubar-it-co/tmdb-client'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'
import { notFound } from 'next/navigation'

import StandalonePhotoViewer from '@/components/PhotoViewer/StandalonePhotoViewer'
import { CACHE_TIME_MS } from '@/types/media'

import type { MediaType } from '@/types/media'
import type { Metadata } from 'next'

/** Valid media types for this route. */
const VALID_MEDIA_TYPES = new Set<MediaType>(['movie', 'tv'])

/** Props for the standalone photo page route. */
interface Props {
  params: Promise<{ mediaType: string; id: string; index: string }>
}

/** Creates a QueryClient with prefetched image data. */
async function createPrefetchedQueryClient(
  mediaType: MediaType,
  contentId: number
): Promise<QueryClient> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: CACHE_TIME_MS } },
  })

  if (mediaType === 'movie') {
    await queryClient.prefetchQuery(
      movieImagesOptions({ path: { movie_id: contentId } })
    )
  } else {
    await queryClient.prefetchQuery(
      tvSeriesImagesOptions({ path: { series_id: contentId } })
    )
  }

  return queryClient
}

/** Dynamic metadata for the standalone photo page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mediaType: rawMediaType } = await params
  const label = rawMediaType === 'tv' ? 'TV Series' : 'Movie'

  return {
    title: `Photo | ${label} | TMDB`,
  }
}

/**
 * Standalone page for a single backdrop photo.
 *
 * Hard-navigation target when visiting /{mediaType}/{id}/photos/{index} directly.
 * Renders with a black background so the modal overlay doesn't reveal an empty page.
 */
export default async function PhotoPage({ params }: Readonly<Props>) {
  const { mediaType: rawMediaType, id, index } = await params
  const mediaType = rawMediaType as MediaType

  if (!VALID_MEDIA_TYPES.has(mediaType)) notFound()

  const contentId = Number(id)

  const queryClient = await createPrefetchedQueryClient(mediaType, contentId)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StandalonePhotoViewer
        id={contentId}
        mediaType={mediaType}
        photoId={index}
      />
    </HydrationBoundary>
  )
}
