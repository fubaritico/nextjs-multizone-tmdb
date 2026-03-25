import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/**
 * Smoke test for the TVPage Server Component.
 *
 * The component is an async function — we call it directly and render the
 * resolved JSX. All `prefetchQuery` calls on the internal `QueryClient` are
 * mocked so the test doesn't need a real TMDB token.
 *
 * Deep behaviour (cache HIT, section rendering, carousels) is covered by the
 * individual section and carousel test suites.
 */

// Mock @tanstack/react-query so prefetchQuery resolves immediately.
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    QueryClient: vi.fn().mockImplementation(() => ({
      prefetchQuery: vi.fn().mockResolvedValue(undefined),
      getDefaultOptions: vi.fn().mockReturnValue({}),
      getQueryData: vi.fn().mockReturnValue(undefined),
    })),
    dehydrate: vi.fn().mockReturnValue({}),
    HydrationBoundary: ({ children }: { children: React.JSX.Element }) => (
      <>{children}</>
    ),
  }
})

// Mock all child section components to isolate page shell logic.
vi.mock('../../../components/MediaHero/TVHero', () => ({
  default: () => <section data-testid="tv-hero" />,
}))

vi.mock('../../../components/Synopsis/TVSynopsis', () => ({
  default: () => <section data-testid="synopsis" />,
}))

vi.mock('../../../components/Crew/TVCrew', () => ({
  default: () => <section data-testid="crew" />,
}))

vi.mock('../../../components/CastSection/TVCastCarousel', () => ({
  default: () => <section data-testid="cast" />,
}))

vi.mock('../../../components/TrailersSection/TVTrailersSection', () => ({
  default: () => <section data-testid="trailers-section" />,
}))

vi.mock('../../../components/SimilarSection/TVSimilarCarousel', () => ({
  default: () => <section data-testid="similar-section" />,
}))

vi.mock('../../../components/RecommendedSection/TVRecommendedCarousel', () => ({
  default: () => <section data-testid="recommended-section" />,
}))

// Mock factory functions — return value is irrelevant since prefetchQuery is mocked.
vi.mock('@fubar-it-co/tmdb-client', () => ({
  tvSeriesDetailsOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesCreditsOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesSimilarOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesRecommendationsOptions: vi
    .fn()
    .mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesVideosOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesImagesOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
}))

import TVPage from './page'

describe('TVPage', () => {
  it('renders without throwing', async () => {
    const jsx = await TVPage({
      params: Promise.resolve({ id: '1396' }),
    })
    render(jsx)
  })

  it('renders all section test IDs', async () => {
    const jsx = await TVPage({
      params: Promise.resolve({ id: '1396' }),
    })
    render(jsx)

    expect(screen.getByTestId('tv-hero')).toBeInTheDocument()
    expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    expect(screen.getByTestId('crew')).toBeInTheDocument()
    expect(screen.getByTestId('cast')).toBeInTheDocument()
    expect(screen.getByTestId('trailers-section')).toBeInTheDocument()
    expect(screen.getByTestId('similar-section')).toBeInTheDocument()
    expect(screen.getByTestId('recommended-section')).toBeInTheDocument()
  })

  it('renders sections in correct order', async () => {
    const jsx = await TVPage({
      params: Promise.resolve({ id: '1396' }),
    })
    const { container } = render(jsx)

    const testIds = Array.from(container.querySelectorAll('[data-testid]')).map(
      (el) => el.getAttribute('data-testid')
    )

    const expectedOrder = [
      'tv-hero',
      'synopsis',
      'crew',
      'cast',
      'trailers-section',
      'similar-section',
      'recommended-section',
    ]

    // Verify each expected section appears and in the right relative order.
    let lastIndex = -1
    for (const testId of expectedOrder) {
      const idx = testIds.indexOf(testId)
      expect(idx).toBeGreaterThan(lastIndex)
      lastIndex = idx
    }
  })
})
