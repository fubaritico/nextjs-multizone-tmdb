'use client'

import { Typography } from '@vite-mf-monorepo/ui'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import type { FC } from 'react'

/** A single TMDB image object. */
export interface TmdbImage {
  /** Path segment e.g. "/abc123.jpg" */
  file_path: string
}

/** Props for the PhotoViewer component. */
export interface PhotoViewerProps {
  /** Array of TMDB backdrop image objects to display. */
  images: TmdbImage[]
  /** Zero-based index of the image to show on mount. */
  initialIndex: number
  /**
   * Base path for the media item, e.g. "/movie/278" or "/tv/1396".
   * Used for prev/next URL construction.
   */
  basePath: string
  /**
   * Optional close callback.
   * When provided (modal variant) it is called instead of `router.back()`.
   */
  onClose?: () => void
}

/**
 * Full-screen photo viewer with prev/next navigation, image counter, close
 * button, and keyboard support (ArrowLeft / ArrowRight / Escape).
 *
 * Used by both the standalone photo page and the intercepted `@modal` route.
 * It never fetches data — images are passed as props by the parent page.
 */
const PhotoViewer: FC<PhotoViewerProps> = (props) => {
  const { images, initialIndex, onClose } = props
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1))
  )

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose()
    } else {
      router.back()
    }
  }, [onClose, router])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(images.length - 1, prev + 1))
  }, [images.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'Escape') handleClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handlePrev, handleNext, handleClose])

  if (!images.length) return null

  const currentImage = images[currentIndex]
  const imageUrl = `https://image.tmdb.org/t/p/original${currentImage.file_path}`
  const isPrevDisabled = currentIndex === 0
  const isNextDisabled = currentIndex === images.length - 1

  return (
    <div
      className="mda:fixed mda:inset-0 mda:z-50 mda:flex mda:flex-col mda:bg-black/90"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      {/* Top bar — counter + close */}
      <div className="mda:flex mda:items-center mda:justify-between mda:px-4 mda:py-3">
        <Typography variant="body" className="mda:text-white">
          {String(currentIndex + 1)} / {String(images.length)}
        </Typography>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close photo viewer"
          className="mda:flex mda:h-10 mda:w-10 mda:items-center mda:justify-center mda:rounded-full mda:text-white mda:transition-opacity hover:mda:opacity-70 mda:focus-visible:outline-none mda:focus-visible:ring-2 mda:focus-visible:ring-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="mda:h-6 mda:w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Image area */}
      <div className="mda:relative mda:flex-1">
        <Image
          src={imageUrl}
          alt={`Photo ${String(currentIndex + 1)} of ${String(images.length)}`}
          fill
          style={{ objectFit: 'contain' }}
          sizes="100vw"
          priority
        />
      </div>

      {/* Bottom bar — prev / next navigation */}
      <div className="mda:flex mda:items-center mda:justify-between mda:px-4 mda:py-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={isPrevDisabled}
          aria-label="Previous photo"
          className="mda:flex mda:h-10 mda:w-10 mda:items-center mda:justify-center mda:rounded-full mda:text-white mda:transition-opacity mda:disabled:opacity-30 hover:mda:opacity-70 mda:focus-visible:outline-none mda:focus-visible:ring-2 mda:focus-visible:ring-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="mda:h-6 mda:w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isNextDisabled}
          aria-label="Next photo"
          className="mda:flex mda:h-10 mda:w-10 mda:items-center mda:justify-center mda:rounded-full mda:text-white mda:transition-opacity mda:disabled:opacity-30 hover:mda:opacity-70 mda:focus-visible:outline-none mda:focus-visible:ring-2 mda:focus-visible:ring-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="mda:h-6 mda:w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default PhotoViewer
