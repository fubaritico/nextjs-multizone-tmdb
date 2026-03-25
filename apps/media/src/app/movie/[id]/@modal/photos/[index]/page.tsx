'use client'

import { movieImagesOptions } from '@fubar-it-co/tmdb-client'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { use } from 'react'

import PhotoViewer from '../../../../../../components/PhotoViewer/PhotoViewer'

import type { MovieImagesResponse } from '@fubar-it-co/tmdb-client'
import type { UseQueryResult } from '@tanstack/react-query'

/** Props for the MoviePhotoModal intercepted route page. */
interface Props {
  /** Route params — `id` is the movie ID, `index` is the zero-based photo index. */
  params: Promise<{ id: string; index: string }>
}

/**
 * Intercepted route page that renders the PhotoViewer as an overlay modal.
 *
 * Active only during soft (client-side) navigation from the movie detail page.
 * Reads images from the already-hydrated TanStack Query cache — no extra fetch.
 * Calls `router.back()` on close to dismiss the modal and restore the detail page.
 */
export default function MoviePhotoModal({ params }: Props) {
  const { id, index } = use(params)
  const movieId = Number(id)
  const photoIndex = Number(index)
  const router = useRouter()

  const { data } = useQuery(
    movieImagesOptions({ path: { movie_id: movieId } })
  ) as UseQueryResult<MovieImagesResponse>

  const backdrops = (data?.backdrops ?? []).flatMap((b) =>
    b.file_path ? [{ file_path: b.file_path }] : []
  )

  if (!backdrops.length) return null

  return (
    <PhotoViewer
      images={backdrops}
      initialIndex={photoIndex}
      basePath={`/movie/${id}`}
      onClose={() => {
        router.back()
      }}
    />
  )
}
