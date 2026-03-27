'use client'

import { Carousel, CarouselItem, IconButton, Modal } from '@vite-mf-monorepo/ui'
import Image from 'next/image'

import type { FC, MouseEvent } from 'react'

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
  /** Callback when the viewer should close. */
  onClose: () => void
  /** Callback to navigate to the previous photo. Undefined disables the prev arrow. */
  onPrev?: () => void
  /** Callback to navigate to the next photo. Undefined disables the next arrow. */
  onNext?: () => void
}

/**
 * Full-screen photo viewer using Modal + Carousel lightbox from @vite-mf-monorepo/ui.
 *
 * Clicking outside the image closes the modal. Prev/next arrows are provided by
 * the Carousel lightbox variant. Close button is positioned top-left.
 */
const PhotoViewer: FC<PhotoViewerProps> = ({
  images,
  initialIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  /**
   * On carousel item click, if user clicks outside the picture, the modal closes.
   * Mimics a click on backdrop element which doesn't exist in native dialog tag.
   */
  const handleCarouselItemClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (!(e.target instanceof HTMLImageElement)) onClose()
  }

  if (!images.length) return null

  return (
    <Modal isOpen onClose={onClose} aria-label="Photo viewer">
      <Carousel
        key={initialIndex}
        variant="lightbox"
        gap={0}
        rounded={false}
        showPagination={false}
        initialIndex={initialIndex}
        disableAnimation
        disableScroll
        onPrev={onPrev}
        onNext={onNext}
      >
        {images.map((image, i) => (
          <CarouselItem
            key={image.file_path}
            isLightbox
            onClick={handleCarouselItemClick}
          >
            <Image
              src={`https://image.tmdb.org/t/p/w1280${image.file_path}`}
              alt={`Backdrop ${String(i + 1)}`}
              width={1280}
              height={720}
              className="mda:max-w-full mda:max-h-[80vh] mda:object-contain"
            />
          </CarouselItem>
        ))}
      </Carousel>
      <IconButton
        icon="XMark"
        aria-label="Close"
        onClick={onClose}
        className="ui:absolute ui:top-4 ui:left-4 ui:text-white hover:ui:bg-white/10 ui:z-10 ui:focus:border-none"
      />
    </Modal>
  )
}

export default PhotoViewer
