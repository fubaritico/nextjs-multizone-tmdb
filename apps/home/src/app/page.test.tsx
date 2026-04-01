import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/**
 * Minimal smoke test for the HomePage Server Component.
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

vi.mock('../lib/blur', () => ({
  getBlurDataMap: vi.fn().mockResolvedValue({}),
}))

// Mock child section components so this test stays focused on the page shell.
vi.mock('../components/HeroSection/HeroSection', () => ({
  default: () => <section data-testid="hero-section" />,
}))

vi.mock('../components/TrendingSection/TrendingSection', () => ({
  default: () => <section data-testid="trending-section" />,
}))

vi.mock('../components/PopularSection/PopularSection', () => ({
  default: () => <section data-testid="popular-section" />,
}))

vi.mock('../components/FreeToWatchSection/FreeToWatchSection', () => ({
  default: () => <section data-testid="free-to-watch-section" />,
}))

// Mock factory functions — return value is irrelevant since prefetchQuery is mocked.
vi.mock('@fubar-it-co/tmdb-client', () => ({
  movieNowPlayingListOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  trendingAllOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  moviePopularListOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesPopularListOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  discoverMovieOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  discoverTvOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
}))

import HomePage from './page'

describe('HomePage', () => {
  it('renders without throwing', async () => {
    const jsx = await HomePage()
    render(jsx)
  })

  it('renders all four sections', async () => {
    const jsx = await HomePage()
    render(jsx)

    expect(screen.getByTestId('hero-section')).toBeInTheDocument()
    expect(screen.getByTestId('trending-section')).toBeInTheDocument()
    expect(screen.getByTestId('popular-section')).toBeInTheDocument()
    expect(screen.getByTestId('free-to-watch-section')).toBeInTheDocument()
  })
})
