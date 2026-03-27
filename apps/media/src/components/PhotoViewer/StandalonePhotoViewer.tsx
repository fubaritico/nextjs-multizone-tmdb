'use client'

import { useRouter } from 'next/navigation'

import { useMediaImages } from '@/hooks'
import { toPhotoId } from '@/types/media'

import PhotoViewer from './PhotoViewer'

import type { MediaType } from '@/types/media'
import type { FC } from 'react'

/** Props for {@link StandalonePhotoViewer}. */
interface StandalonePhotoViewerProps {
  /** TMDB content ID. */
  id: number
  /** Whether this is a movie or TV series. */
  mediaType: MediaType
  /** URL param — photo id derived from file_path (e.g. "abc123"). */
  photoId: string
}

/**
 * Client wrapper for the standalone photo page.
 *
 * Reads images from the hydrated TanStack Query cache and provides
 * close / prev / next navigation via `router.back()` and `router.replace()`.
 * Resolves the current index from the photo id via `findIndex`, like the legacy.
 */
const StandalonePhotoViewer: FC<StandalonePhotoViewerProps> = ({
  id,
  mediaType,
  photoId,
}) => {
  const router = useRouter()
  const { data } = useMediaImages(mediaType, id)

  const backdrops = (data?.backdrops ?? []).flatMap((b) =>
    b.file_path ? [{ file_path: b.file_path }] : []
  )

  if (!backdrops.length) return null

  const currentIndex = backdrops.findIndex(
    (b) => toPhotoId(b.file_path) === photoId
  )
  const safeIndex = currentIndex === -1 ? 0 : currentIndex
  const basePath = `/${mediaType}/${String(id)}/photos`

  const handleClose = () => {
    router.back()
  }

  const handlePrev =
    safeIndex > 0
      ? () => {
          const prevId = toPhotoId(backdrops[safeIndex - 1].file_path)
          router.replace(`${basePath}/${prevId}`)
        }
      : undefined

  const handleNext =
    safeIndex < backdrops.length - 1
      ? () => {
          const nextId = toPhotoId(backdrops[safeIndex + 1].file_path)
          router.replace(`${basePath}/${nextId}`)
        }
      : undefined

  return (
    <PhotoViewer
      images={backdrops}
      initialIndex={safeIndex}
      onClose={handleClose}
      onPrev={handlePrev}
      onNext={handleNext}
    />
  )
}

export default StandalonePhotoViewer
