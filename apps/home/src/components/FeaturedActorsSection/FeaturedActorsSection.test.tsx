import { screen } from '@testing-library/react'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { describe, expect, it, vi } from 'vitest'

import FeaturedActorsSection from './FeaturedActorsSection'

vi.mock('./FeaturedActorsCarousel', () => ({
  default: () => <div data-testid="featured-actors-carousel" />,
}))

describe('FeaturedActorsSection', () => {
  it('renders the "Featured Actors" heading', () => {
    renderWithReactQuery(<FeaturedActorsSection />)

    expect(screen.getByText('Featured Actors')).toBeInTheDocument()
  })

  it('renders the FeaturedActorsCarousel', () => {
    renderWithReactQuery(<FeaturedActorsSection />)

    expect(screen.getByTestId('featured-actors-carousel')).toBeInTheDocument()
  })
})
