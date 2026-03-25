import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

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

const mockBack = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack }),
}))

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
    it('renders the image at initialIndex', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={1} basePath="/movie/278" />
      )

      const img = screen.getByRole('img')
      expect(img).toHaveAttribute(
        'src',
        'https://image.tmdb.org/t/p/original/photo2.jpg'
      )
    })

    it('shows the correct counter text', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={0} basePath="/movie/278" />
      )

      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('renders nothing when images array is empty', () => {
      const { container } = render(
        <PhotoViewer images={[]} initialIndex={0} basePath="/movie/278" />
      )

      expect(container).toBeEmptyDOMElement()
    })

    it('clamps initialIndex below 0 to 0', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={-5} basePath="/movie/278" />
      )

      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('clamps initialIndex beyond last index to last', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={99} basePath="/movie/278" />
      )

      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('advances to next image on Next button click', async () => {
      const user = userEvent.setup()

      render(
        <PhotoViewer images={IMAGES} initialIndex={0} basePath="/movie/278" />
      )

      await user.click(screen.getByRole('button', { name: /next photo/i }))

      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })

    it('goes back to previous image on Prev button click', async () => {
      const user = userEvent.setup()

      render(
        <PhotoViewer images={IMAGES} initialIndex={2} basePath="/movie/278" />
      )

      await user.click(screen.getByRole('button', { name: /previous photo/i }))

      expect(screen.getByText('2 / 3')).toBeInTheDocument()
    })

    it('disables Prev button at index 0', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={0} basePath="/movie/278" />
      )

      expect(
        screen.getByRole('button', { name: /previous photo/i })
      ).toBeDisabled()
    })

    it('disables Next button at last index', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={2} basePath="/movie/278" />
      )

      expect(screen.getByRole('button', { name: /next photo/i })).toBeDisabled()
    })

    it('does not disable Prev when not at first index', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={1} basePath="/movie/278" />
      )

      expect(
        screen.getByRole('button', { name: /previous photo/i })
      ).not.toBeDisabled()
    })

    it('does not disable Next when not at last index', () => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={1} basePath="/movie/278" />
      )

      expect(
        screen.getByRole('button', { name: /next photo/i })
      ).not.toBeDisabled()
    })
  })

  describe('close button', () => {
    it('calls onClose when provided', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()

      render(
        <PhotoViewer
          images={IMAGES}
          initialIndex={0}
          basePath="/movie/278"
          onClose={onClose}
        />
      )

      await user.click(
        screen.getByRole('button', { name: /close photo viewer/i })
      )

      expect(onClose).toHaveBeenCalledOnce()
      expect(mockBack).not.toHaveBeenCalled()
    })

    it('calls router.back() when onClose is not provided', async () => {
      const user = userEvent.setup()

      render(
        <PhotoViewer images={IMAGES} initialIndex={0} basePath="/movie/278" />
      )

      await user.click(
        screen.getByRole('button', { name: /close photo viewer/i })
      )

      expect(mockBack).toHaveBeenCalledOnce()
    })
  })

  describe('keyboard navigation', () => {
    beforeEach(() => {
      render(
        <PhotoViewer images={IMAGES} initialIndex={1} basePath="/movie/278" />
      )
    })

    it('navigates to previous image on ArrowLeft', async () => {
      const user = userEvent.setup()

      await user.keyboard('{ArrowLeft}')

      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('navigates to next image on ArrowRight', async () => {
      const user = userEvent.setup()

      await user.keyboard('{ArrowRight}')

      expect(screen.getByText('3 / 3')).toBeInTheDocument()
    })

    it('calls router.back() on Escape', async () => {
      const user = userEvent.setup()

      await user.keyboard('{Escape}')

      expect(mockBack).toHaveBeenCalledOnce()
    })
  })
})
