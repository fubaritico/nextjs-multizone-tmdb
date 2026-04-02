'use client'

import { IconButton, Modal } from '@vite-mf-monorepo/ui'
import clsx from 'clsx'
import Image from 'next/image'
import { useEffect } from 'react'

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
  /** Zero-based index of the currently displayed image. */
  currentIndex: number
  /** Whether a previous image is available. */
  canPrev: boolean
  /** Whether a next image is available. */
  canNext: boolean
  /** Navigate to the previous image. */
  onPrev: () => void
  /** Navigate to the next image. */
  onNext: () => void
  /** Close the photo viewer. */
  onClose: () => void
  /** When true, renders a fully opaque black backdrop (hard navigation). */
  opaqueBackdrop?: boolean
}

/**
 * Full-screen photo viewer with Modal overlay.
 *
 * Purely presentational — navigation state is managed by the parent
 * via URL (router.push). Keyboard arrows and nav buttons trigger
 * onPrev/onNext callbacks.
 */
const PhotoViewer: FC<PhotoViewerProps> = ({
  images,
  currentIndex,
  canPrev,
  canNext,
  onPrev,
  onNext,
  onClose,
  opaqueBackdrop = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && canPrev) onPrev()
      if (e.key === 'ArrowRight' && canNext) onNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onPrev, onNext, canPrev, canNext])

  if (!images.length) return null

  const image = images[currentIndex]

  return (
    <Modal isOpen onClose={onClose} aria-label="Photo viewer">
      {opaqueBackdrop && (
        <style>{`dialog[aria-label="Photo viewer"]::backdrop { background: #1a1a1a !important; }`}</style>
      )}
      <div className="mda:relative mda:flex mda:items-center mda:justify-center mda:w-full mda:h-full">
        {/* Backdrop button for click-to-close */}
        <button
          type="button"
          aria-label="Close photo viewer"
          onClick={onClose}
          className="mda:absolute mda:inset-0 mda:w-full mda:h-full mda:border-0 mda:bg-transparent mda:p-0 mda:cursor-default"
        />

        {/* Image */}
        <div className="mda:relative mda:z-[1] mda:w-full mda:h-[80vh] mda:max-w-[1280px] mda:pointer-events-none">
          <Image
            src={`https://image.tmdb.org/t/p/w1280${image.file_path}`}
            alt={`Backdrop ${String(currentIndex + 1)}`}
            fill
            loading="eager"
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="mda:object-contain mda:rounded-md"
          />
        </div>

        {/* Previous */}
        <div className="mda:absolute mda:left-4 mda:top-1/2 mda:-translate-y-1/2 mda:z-10">
          <IconButton
            icon="ChevronLeft"
            variant="ghost"
            aria-label="Previous"
            onClick={onPrev}
            disabled={!canPrev}
            className={clsx('mda:rounded-full', {
              'mda:bg-white/70 hover:mda:bg-white/90 mda:text-black': canPrev,
              'mda:bg-white/20 mda:text-white/30 mda:cursor-not-allowed':
                !canPrev,
            })}
          />
        </div>

        {/* Next */}
        <div className="mda:absolute mda:right-4 mda:top-1/2 mda:-translate-y-1/2 mda:z-10">
          <IconButton
            icon="ChevronRight"
            variant="ghost"
            aria-label="Next"
            onClick={onNext}
            disabled={!canNext}
            className={clsx('mda:rounded-full', {
              'mda:bg-white/70 hover:mda:bg-white/90 mda:text-black': canNext,
              'mda:bg-white/20 mda:text-white/30 mda:cursor-not-allowed':
                !canNext,
            })}
          />
        </div>

        {/* Counter */}
        <div className="mda:absolute mda:top-4 mda:right-4 mda:z-10 mda:bg-black/50 mda:rounded-full mda:px-3 mda:py-1 mda:text-white/90 mda:text-sm mda:font-medium mda:tabular-nums">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Close */}
        <IconButton
          icon="XMark"
          aria-label="Close"
          onClick={onClose}
          className="mda:absolute mda:top-4 mda:left-4 ui:text-white hover:ui:bg-white/10 mda:z-10 ui:focus:border-none"
        />
      </div>
    </Modal>
  )
}

export default PhotoViewer
