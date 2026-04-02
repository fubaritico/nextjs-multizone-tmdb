'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

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
 * URL-synced navigation. Prev/next push new URLs to browser history.
 */
const StandalonePhotoViewer: FC<StandalonePhotoViewerProps> = ({
  id,
  mediaType,
  photoId,
}) => {
  const router = useRouter()
  const { data } = useMediaImages(mediaType, id)

  const backdrops = useMemo(
    () =>
      (data?.backdrops ?? []).flatMap((b) =>
        b.file_path ? [{ file_path: b.file_path }] : []
      ),
    [data?.backdrops]
  )

  const currentIndex = useMemo(() => {
    const idx = backdrops.findIndex((b) => toPhotoId(b.file_path) === photoId)
    return idx === -1 ? 0 : idx
  }, [backdrops, photoId])

  const canPrev = currentIndex > 0
  const canNext = currentIndex < backdrops.length - 1

  /** Navigates to the previous photo by pushing its URL to history. */
  const handlePrev = useCallback(() => {
    if (!canPrev) return
    const prevId = toPhotoId(backdrops[currentIndex - 1].file_path)
    router.push(`/${mediaType}/${String(id)}/photos/${prevId}`)
  }, [canPrev, backdrops, currentIndex, mediaType, id, router])

  /** Navigates to the next photo by pushing its URL to history. */
  const handleNext = useCallback(() => {
    if (!canNext) return
    const nextId = toPhotoId(backdrops[currentIndex + 1].file_path)
    router.push(`/${mediaType}/${String(id)}/photos/${nextId}`)
  }, [canNext, backdrops, currentIndex, mediaType, id, router])

  /** Closes the viewer by navigating back to the media detail page. */
  const handleClose = useCallback(() => {
    router.push(`/${mediaType}/${String(id)}`)
  }, [router, mediaType, id])

  if (!backdrops.length) return null

  return (
    <PhotoViewer
      images={backdrops}
      currentIndex={currentIndex}
      canPrev={canPrev}
      canNext={canNext}
      onPrev={handlePrev}
      onNext={handleNext}
      onClose={handleClose}
      opaqueBackdrop
    />
  )
}

export default StandalonePhotoViewer
