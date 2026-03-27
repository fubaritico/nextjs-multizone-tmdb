import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import PhotoViewer from './PhotoViewer'

import type { TmdbImage } from './PhotoViewer'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    sizes: _sizes,
    style: _style,
    ...props
  }: {
    src: string
    alt: string
    fill?: boolean
    priority?: boolean
    sizes?: string
    style?: React.CSSProperties
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}))

// jsdom does not implement <dialog> methods — mock them so RTL finds the dialog
const showModalMock = vi.fn(() => {
  screen.getByRole('dialog', { hidden: true }).setAttribute('open', '')
})
const closeMock = vi.fn()
HTMLDialogElement.prototype.showModal = showModalMock
HTMLDialogElement.prototype.close = closeMock

const IMAGES: TmdbImage[] = [
  { file_path: '/photo1.jpg' },
  { file_path: '/photo2.jpg' },
  { file_path: '/photo3.jpg' },
]

afterEach(() => {
  vi.clearAllMocks()
})

describe('PhotoViewer', () => {
  describe('rendering', () => {
    it('opens the modal with all images', () => {
      const onClose = vi.fn()

      render(<PhotoViewer images={IMAGES} initialIndex={0} onClose={onClose} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getAllByRole('img')).toHaveLength(IMAGES.length)
    })

    it('renders correct image src with w1280 size', () => {
      const onClose = vi.fn()

      render(<PhotoViewer images={IMAGES} initialIndex={0} onClose={onClose} />)

      const img = screen.getByRole('img', { name: 'Backdrop 1' })
      expect(img).toHaveAttribute(
        'src',
        'https://image.tmdb.org/t/p/w1280/photo1.jpg'
      )
    })

    it('renders nothing when images array is empty', () => {
      const onClose = vi.fn()

      const { container } = render(
        <PhotoViewer images={[]} initialIndex={0} onClose={onClose} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('close', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<PhotoViewer images={IMAGES} initialIndex={0} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: /close/i }))

      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when clicking outside the image', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<PhotoViewer images={IMAGES} initialIndex={0} onClose={onClose} />)

      // Click a CarouselItem div (not the img) — should trigger close
      const carouselItems = screen.getAllByRole('img')
      const parentDiv = carouselItems[0]?.closest('[class]')?.parentElement
      if (parentDiv) {
        await user.click(parentDiv)
        expect(onClose).toHaveBeenCalled()
      }
    })
  })

  describe('navigation callbacks', () => {
    it('calls onPrev when prev arrow is clicked', async () => {
      const user = userEvent.setup()
      const onPrev = vi.fn()

      render(
        <PhotoViewer
          images={IMAGES}
          initialIndex={1}
          onClose={vi.fn()}
          onPrev={onPrev}
          onNext={vi.fn()}
        />
      )

      await user.click(screen.getByRole('button', { name: /previous/i }))

      expect(onPrev).toHaveBeenCalledOnce()
    })

    it('calls onNext when next arrow is clicked', async () => {
      const user = userEvent.setup()
      const onNext = vi.fn()

      render(
        <PhotoViewer
          images={IMAGES}
          initialIndex={1}
          onClose={vi.fn()}
          onPrev={vi.fn()}
          onNext={onNext}
        />
      )

      await user.click(screen.getByRole('button', { name: /next/i }))

      expect(onNext).toHaveBeenCalledOnce()
    })

    it('disables prev arrow when onPrev is undefined', () => {
      render(
        <PhotoViewer
          images={IMAGES}
          initialIndex={0}
          onClose={vi.fn()}
          onNext={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    })

    it('disables next arrow when onNext is undefined', () => {
      render(
        <PhotoViewer
          images={IMAGES}
          initialIndex={2}
          onClose={vi.fn()}
          onPrev={vi.fn()}
        />
      )

      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })
  })
})
