'use client'

import { usePathname, useRouter } from 'next/navigation'
import { use, useCallback, useMemo } from 'react'

import PhotoViewer from '@/components/PhotoViewer'
import { useMediaImages } from '@/hooks'
import { toPhotoId } from '@/types/media'

import type { MediaType } from '@/types/media'

/** Props for the photo modal parallel route page. */
interface Props {
  /** Route params — `mediaType`, `id`, and `index` (photo id derived from file_path). */
  params: Promise<{ mediaType: string; id: string; index: string }>
}

/**
 * Parallel route page that renders the PhotoViewer as an overlay modal.
 *
 * Reads images from the already-hydrated TanStack Query cache — no extra fetch.
 * Prev/next navigation pushes new URLs to keep browser history in sync.
 *
 * Uses `usePathname()` to detect when the URL no longer matches a photo route
 * and unmounts the modal — workaround for Next.js parallel routes not clearing
 * slots on `router.push()` (known bug across Next.js 13–16).
 */
export default function PhotoModal({ params }: Readonly<Props>) {
  const { mediaType: rawMediaType, id, index } = use(params)
  const mediaType = rawMediaType as MediaType
  const contentId = Number(id)
  const pathname = usePathname()
  const router = useRouter()
  const { data } = useMediaImages(mediaType, contentId)

  const backdrops = useMemo(
    () =>
      (data?.backdrops ?? []).flatMap((b) =>
        b.file_path ? [{ file_path: b.file_path }] : []
      ),
    [data?.backdrops]
  )

  const currentIndex = useMemo(() => {
    const idx = backdrops.findIndex((b) => toPhotoId(b.file_path) === index)
    return idx === -1 ? 0 : idx
  }, [backdrops, index])

  const canPrev = currentIndex > 0
  const canNext = currentIndex < backdrops.length - 1

  /** Navigates to the previous photo by pushing its URL to history. */
  const handlePrev = useCallback(() => {
    if (!canPrev) return
    const prevId = toPhotoId(backdrops[currentIndex - 1].file_path)
    router.push(`/${rawMediaType}/${id}/photos/${prevId}`)
  }, [canPrev, backdrops, currentIndex, rawMediaType, id, router])

  /** Navigates to the next photo by pushing its URL to history. */
  const handleNext = useCallback(() => {
    if (!canNext) return
    const nextId = toPhotoId(backdrops[currentIndex + 1].file_path)
    router.push(`/${rawMediaType}/${id}/photos/${nextId}`)
  }, [canNext, backdrops, currentIndex, rawMediaType, id, router])

  /** Closes the modal by navigating back to the media detail page. */
  const handleClose = useCallback(() => {
    router.push(`/${rawMediaType}/${id}`)
  }, [router, rawMediaType, id])

  // Unmount modal when URL no longer matches a photo route
  if (!pathname.includes('/photos/') || !backdrops.length) return null

  return (
    <PhotoViewer
      images={backdrops}
      currentIndex={currentIndex}
      canPrev={canPrev}
      canNext={canNext}
      onPrev={handlePrev}
      onNext={handleNext}
      onClose={handleClose}
    />
  )
}
