'use client'

import { useRouter } from 'next/navigation'
import { use } from 'react'

import PhotoViewer from '@/components/PhotoViewer'
import { useMediaImages } from '@/hooks'
import { toPhotoId } from '@/types/media'

import type { MediaType } from '@/types/media'

/** Props for the photo modal intercepted route page. */
interface Props {
  /** Route params — `mediaType`, `id`, and `index` (photo id derived from file_path). */
  params: Promise<{ mediaType: string; id: string; index: string }>
}

/**
 * Intercepted route page that renders the PhotoViewer as an overlay modal.
 *
 * Active only during soft (client-side) navigation from the media detail page.
 * Reads images from the already-hydrated TanStack Query cache — no extra fetch.
 * Calls `router.back()` on close to dismiss the modal and restore the detail page.
 */
export default function PhotoModal({ params }: Readonly<Props>) {
  const { mediaType: rawMediaType, id, index } = use(params)
  const mediaType = rawMediaType as MediaType
  const contentId = Number(id)
  const router = useRouter()
  const { data } = useMediaImages(mediaType, contentId)

  const backdrops = (data?.backdrops ?? []).flatMap((b) =>
    b.file_path ? [{ file_path: b.file_path }] : []
  )

  if (!backdrops.length) return null

  const currentIndex = backdrops.findIndex(
    (b) => toPhotoId(b.file_path) === index
  )
  const safeIndex = currentIndex === -1 ? 0 : currentIndex
  const basePath = `/${mediaType}/${id}/photos`

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
