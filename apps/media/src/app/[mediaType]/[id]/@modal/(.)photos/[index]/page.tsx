'use client'

import {
  movieImagesOptions,
  tvSeriesImagesOptions,
} from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { use } from 'react'

import PhotoViewer from '@/components/PhotoViewer'

import type { MediaType } from '@/types/media'

/** Props for the photo modal intercepted route page. */
interface Props {
  /** Route params — `mediaType`, `id`, and `index`. */
  params: Promise<{ mediaType: string; id: string; index: string }>
}

/**
 * Intercepted route page that renders the PhotoViewer as an overlay modal.
 *
 * Active only during soft (client-side) navigation from the media detail page.
 * Reads images from the already-hydrated TanStack Query cache — no extra fetch.
 * Calls `router.back()` on close to dismiss the modal and restore the detail page.
 */
export default function PhotoModal({ params }: Props) {
  const { mediaType: rawMediaType, id, index } = use(params)
  const mediaType = rawMediaType as MediaType
  const contentId = Number(id)
  const photoIndex = Number(index)
  const router = useRouter()

  const movieQuery = useQuery({
    ...movieImagesOptions({ path: { movie_id: contentId } }),
    enabled: mediaType === 'movie',
  })

  const tvQuery = useQuery({
    ...tvSeriesImagesOptions({ path: { series_id: contentId } }),
    enabled: mediaType === 'tv',
  })

  const { data } = mediaType === 'movie' ? movieQuery : tvQuery

  const backdrops = (data?.backdrops ?? []).flatMap((b) =>
    b.file_path ? [{ file_path: b.file_path }] : []
  )

  if (!backdrops.length) return null

  return (
    <PhotoViewer
      images={backdrops}
      initialIndex={photoIndex}
      basePath={`/${mediaType}/${id}`}
      onClose={() => {
        router.back()
      }}
    />
  )
}
