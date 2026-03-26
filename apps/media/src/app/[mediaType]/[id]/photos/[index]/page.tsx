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

import PhotoViewer from '@/components/PhotoViewer'
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
  const { mediaType: rawMediaType, index } = await params
  const photoIndex = Number(index)
  const label = rawMediaType === 'tv' ? 'TV Series' : 'Movie'

  return {
    title: `Photo ${String(photoIndex + 1)} | ${label} | TMDB`,
  }
}

/**
 * Standalone page for a single backdrop photo.
 * Hard-navigation target when visiting /{mediaType}/{id}/photos/{index} directly.
 */
export default async function PhotoPage({ params }: Readonly<Props>) {
  const { mediaType: rawMediaType, id, index } = await params
  const mediaType = rawMediaType as MediaType

  if (!VALID_MEDIA_TYPES.has(mediaType)) notFound()

  const contentId = Number(id)
  const photoIndex = Number(index)

  const queryClient = await createPrefetchedQueryClient(mediaType, contentId)

  interface ImagesData {
    backdrops?: { file_path?: string }[]
  }

  const queryKey =
    mediaType === 'movie'
      ? movieImagesOptions({ path: { movie_id: contentId } }).queryKey
      : tvSeriesImagesOptions({ path: { series_id: contentId } }).queryKey

  const imagesData = queryClient.getQueryData<ImagesData>(queryKey)

  const backdrops = (imagesData?.backdrops ?? []).flatMap((b) =>
    b.file_path ? [{ file_path: b.file_path }] : []
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PhotoViewer
        images={backdrops}
        initialIndex={photoIndex}
        basePath={`/${mediaType}/${id}`}
      />
    </HydrationBoundary>
  )
}
