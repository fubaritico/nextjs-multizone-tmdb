import { movieImagesOptions } from '@fubar-it-co/tmdb-client'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import PhotoViewer from '../../../../../components/PhotoViewer/PhotoViewer'
import { CACHE_TIME_MS } from '../../../../../types/media'

import type { MovieImagesResponse } from '@fubar-it-co/tmdb-client'
import type { Metadata } from 'next'

/** Props for the MoviePhotoPage route. */
interface Props {
  params: Promise<{ id: string; index: string }>
}

/**
 * Shared QueryClient factory — deduplicates the TMDB fetch between
 * `generateMetadata` and the page render within the same request.
 */
async function getQueryClient(movieId: number): Promise<QueryClient> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: CACHE_TIME_MS } },
  })

  await queryClient.prefetchQuery(
    movieImagesOptions({ path: { movie_id: movieId } })
  )

  return queryClient
}

/** Dynamic metadata for the standalone movie photo page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { index } = await params
  const photoIndex = Number(index)

  return {
    title: `Photo ${String(photoIndex + 1)} | Movie | TMDB`,
  }
}

/**
 * Standalone page for a single movie backdrop photo.
 * Hard-navigation target when visiting /movie/[id]/photos/[index] directly.
 */
export default async function MoviePhotoPage({ params }: Props) {
  const { id, index } = await params
  const movieId = Number(id)
  const photoIndex = Number(index)

  const queryClient = await getQueryClient(movieId)

  const imagesData = queryClient.getQueryData<MovieImagesResponse>(
    movieImagesOptions({ path: { movie_id: movieId } }).queryKey
  )

  const backdrops = (imagesData?.backdrops ?? []).flatMap((b) =>
    b.file_path ? [{ file_path: b.file_path }] : []
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PhotoViewer
        images={backdrops}
        initialIndex={photoIndex}
        basePath={`/movie/${id}`}
      />
    </HydrationBoundary>
  )
}
