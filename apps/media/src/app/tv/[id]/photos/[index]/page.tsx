import { tvSeriesImagesOptions } from '@fubar-it-co/tmdb-client'
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

import PhotoViewer from '../../../../../components/PhotoViewer/PhotoViewer'
import { CACHE_TIME_MS } from '../../../../../types/media'

import type { TvSeriesImagesResponse } from '@fubar-it-co/tmdb-client'
import type { Metadata } from 'next'

/** Props for the TVPhotoPage route. */
interface Props {
  params: Promise<{ id: string; index: string }>
}

/**
 * Shared QueryClient factory — deduplicates the TMDB fetch between
 * `generateMetadata` and the page render within the same request.
 */
async function getQueryClient(seriesId: number): Promise<QueryClient> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: CACHE_TIME_MS } },
  })

  await queryClient.prefetchQuery(
    tvSeriesImagesOptions({ path: { series_id: seriesId } })
  )

  return queryClient
}

/** Dynamic metadata for the standalone TV series photo page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { index } = await params
  const photoIndex = Number(index)

  return {
    title: `Photo ${String(photoIndex + 1)} | TV Series | TMDB`,
  }
}

/**
 * Standalone page for a single TV series backdrop photo.
 * Hard-navigation target when visiting /tv/[id]/photos/[index] directly.
 */
export default async function TVPhotoPage({ params }: Props) {
  const { id, index } = await params
  const seriesId = Number(id)
  const photoIndex = Number(index)

  const queryClient = await getQueryClient(seriesId)

  const imagesData = queryClient.getQueryData<TvSeriesImagesResponse>(
    tvSeriesImagesOptions({ path: { series_id: seriesId } }).queryKey
  )

  const backdrops = (imagesData?.backdrops ?? []).flatMap((b) =>
    b.file_path ? [{ file_path: b.file_path }] : []
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PhotoViewer
        images={backdrops}
        initialIndex={photoIndex}
        basePath={`/tv/${id}`}
      />
    </HydrationBoundary>
  )
}
