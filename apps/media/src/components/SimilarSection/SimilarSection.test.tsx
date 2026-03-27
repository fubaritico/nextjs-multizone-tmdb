import { screen } from '@testing-library/react'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SimilarSection from './SimilarSection'

vi.mock('./SimilarMoviesCarousel', () => ({
  default: () => (
    <div data-testid="similar-movies-carousel">Movies Carousel</div>
  ),
}))

vi.mock('./SimilarTVCarousel', () => ({
  default: () => <div data-testid="similar-tv-carousel">TV Carousel</div>,
}))

describe('SimilarSection', () => {
  it('renders "You may also like" section heading', () => {
    renderWithReactQuery(<SimilarSection id={278} mediaType="movie" />)

    expect(
      screen.getByRole('heading', { name: 'You may also like' })
    ).toBeInTheDocument()
  })

  it('displays SimilarMoviesCarousel for movie mediaType', () => {
    renderWithReactQuery(<SimilarSection id={278} mediaType="movie" />)

    expect(screen.getByTestId('similar-movies-carousel')).toBeInTheDocument()
  })

  it('displays SimilarTVCarousel for tv mediaType', () => {
    renderWithReactQuery(<SimilarSection id={1399} mediaType="tv" />)

    expect(screen.getByTestId('similar-tv-carousel')).toBeInTheDocument()
  })
})
