import { screen } from '@testing-library/react'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { describe, expect, it, vi } from 'vitest'

import RecommendedSection from './RecommendedSection'

vi.mock('./RecommendedMoviesCarousel', () => ({
  default: () => (
    <div data-testid="recommended-movies-carousel">Movies Carousel</div>
  ),
}))

vi.mock('./RecommendedTVCarousel', () => ({
  default: () => <div data-testid="recommended-tv-carousel">TV Carousel</div>,
}))

describe('RecommendedSection', () => {
  it('renders "Recommended for you" section heading', () => {
    renderWithReactQuery(<RecommendedSection id={278} mediaType="movie" />)

    expect(
      screen.getByRole('heading', { name: 'Recommended for you' })
    ).toBeInTheDocument()
  })

  it('displays RecommendedMoviesCarousel for movie mediaType', () => {
    renderWithReactQuery(<RecommendedSection id={278} mediaType="movie" />)

    expect(
      screen.getByTestId('recommended-movies-carousel')
    ).toBeInTheDocument()
  })

  it('displays RecommendedTVCarousel for tv mediaType', () => {
    renderWithReactQuery(<RecommendedSection id={1399} mediaType="tv" />)

    expect(screen.getByTestId('recommended-tv-carousel')).toBeInTheDocument()
  })
})
