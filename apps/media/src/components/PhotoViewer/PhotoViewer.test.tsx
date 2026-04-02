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
  const defaultProps = {
    images: IMAGES,
    currentIndex: 0,
    canPrev: false,
    canNext: true,
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onClose: vi.fn(),
  }

  describe('rendering', () => {
    it('renders the image at currentIndex', () => {
      render(<PhotoViewer {...defaultProps} currentIndex={1} canPrev canNext />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByRole('img', { name: 'Backdrop 2' })).toHaveAttribute(
        'src',
        'https://image.tmdb.org/t/p/w1280/photo2.jpg'
      )
    })

    it('renders correct image src with w1280 size', () => {
      render(<PhotoViewer {...defaultProps} />)

      expect(screen.getByRole('img', { name: 'Backdrop 1' })).toHaveAttribute(
        'src',
        'https://image.tmdb.org/t/p/w1280/photo1.jpg'
      )
    })

    it('renders nothing when images array is empty', () => {
      const { container } = render(
        <PhotoViewer {...defaultProps} images={[]} />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe('close', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(<PhotoViewer {...defaultProps} onClose={onClose} />)

      await user.click(screen.getByRole('button', { name: 'Close' }))

      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('navigation', () => {
    it('calls onNext when next arrow is clicked', async () => {
      const user = userEvent.setup()
      const onNext = vi.fn()

      render(<PhotoViewer {...defaultProps} onNext={onNext} />)

      await user.click(screen.getByRole('button', { name: /next/i }))

      expect(onNext).toHaveBeenCalledOnce()
    })

    it('calls onPrev when prev arrow is clicked', async () => {
      const user = userEvent.setup()
      const onPrev = vi.fn()

      render(
        <PhotoViewer
          {...defaultProps}
          currentIndex={2}
          canPrev
          canNext={false}
          onPrev={onPrev}
        />
      )

      await user.click(screen.getByRole('button', { name: /previous/i }))

      expect(onPrev).toHaveBeenCalledOnce()
    })

    it('disables prev arrow when canPrev is false', () => {
      render(<PhotoViewer {...defaultProps} canPrev={false} />)

      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled()
    })

    it('disables next arrow when canNext is false', () => {
      render(<PhotoViewer {...defaultProps} currentIndex={2} canNext={false} />)

      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })

    it('calls onNext on ArrowRight key', async () => {
      const user = userEvent.setup()
      const onNext = vi.fn()

      render(<PhotoViewer {...defaultProps} onNext={onNext} />)

      await user.keyboard('{ArrowRight}')

      expect(onNext).toHaveBeenCalledOnce()
    })

    it('calls onPrev on ArrowLeft key', async () => {
      const user = userEvent.setup()
      const onPrev = vi.fn()

      render(
        <PhotoViewer
          {...defaultProps}
          currentIndex={1}
          canPrev
          onPrev={onPrev}
        />
      )

      await user.keyboard('{ArrowLeft}')

      expect(onPrev).toHaveBeenCalledOnce()
    })

    it('does not call onPrev on ArrowLeft when canPrev is false', async () => {
      const user = userEvent.setup()
      const onPrev = vi.fn()

      render(<PhotoViewer {...defaultProps} canPrev={false} onPrev={onPrev} />)

      await user.keyboard('{ArrowLeft}')

      expect(onPrev).not.toHaveBeenCalled()
    })
  })
})
