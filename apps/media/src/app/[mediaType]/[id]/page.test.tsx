import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

/**
 * Smoke test for the MediaPage Server Component.
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
vi.mock('../../../components/MediaHero/MediaHero', () => ({
  default: () => <section data-testid="media-hero" />,
}))

vi.mock('../../../components/Synopsis/Synopsis', () => ({
  default: () => <section data-testid="synopsis" />,
}))

vi.mock('../../../components/Crew/Crew', () => ({
  default: () => <section data-testid="crew" />,
}))

vi.mock('../../../components/BackdropSection/BackdropSection', () => ({
  default: () => <section data-testid="photos" />,
}))

vi.mock('../../../components/CastSection/CastCarousel', () => ({
  default: () => <section data-testid="cast" />,
}))

vi.mock('../../../components/TrailersSection/TrailersSection', () => ({
  default: () => <section data-testid="trailers-section" />,
}))

vi.mock('../../../components/SimilarSection/SimilarCarousel', () => ({
  default: () => <section data-testid="similar-section" />,
}))

vi.mock('../../../components/RecommendedSection/RecommendedCarousel', () => ({
  default: () => <section data-testid="recommended-section" />,
}))

// Mock factory functions — return value is irrelevant since prefetchQuery is mocked.
vi.mock('@fubar-it-co/tmdb-client', () => ({
  movieDetailsOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  movieCreditsOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  movieSimilarOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  movieRecommendationsOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  movieVideosOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  movieImagesOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesDetailsOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesCreditsOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesSimilarOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesRecommendationsOptions: vi
    .fn()
    .mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesVideosOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
  tvSeriesImagesOptions: vi.fn().mockReturnValue({ queryKey: ['mock'] }),
}))

import MediaPage from './page'

describe('MediaPage', () => {
  it('renders movie page without throwing', async () => {
    const jsx = await MediaPage({
      params: Promise.resolve({ mediaType: 'movie', id: '278' }),
    })
    render(jsx)
  })

  it('renders tv page without throwing', async () => {
    const jsx = await MediaPage({
      params: Promise.resolve({ mediaType: 'tv', id: '1396' }),
    })
    render(jsx)
  })

  it('renders all section test IDs for movie', async () => {
    const jsx = await MediaPage({
      params: Promise.resolve({ mediaType: 'movie', id: '278' }),
    })
    render(jsx)

    expect(screen.getByTestId('media-hero')).toBeInTheDocument()
    expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    expect(screen.getByTestId('crew')).toBeInTheDocument()
    expect(screen.getByTestId('photos')).toBeInTheDocument()
    expect(screen.getByTestId('cast')).toBeInTheDocument()
    expect(screen.getByTestId('trailers-section')).toBeInTheDocument()
    expect(screen.getByTestId('similar-section')).toBeInTheDocument()
    expect(screen.getByTestId('recommended-section')).toBeInTheDocument()
  })

  it('renders all section test IDs for tv', async () => {
    const jsx = await MediaPage({
      params: Promise.resolve({ mediaType: 'tv', id: '1396' }),
    })
    render(jsx)

    expect(screen.getByTestId('media-hero')).toBeInTheDocument()
    expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    expect(screen.getByTestId('crew')).toBeInTheDocument()
    expect(screen.getByTestId('photos')).toBeInTheDocument()
    expect(screen.getByTestId('cast')).toBeInTheDocument()
    expect(screen.getByTestId('trailers-section')).toBeInTheDocument()
    expect(screen.getByTestId('similar-section')).toBeInTheDocument()
    expect(screen.getByTestId('recommended-section')).toBeInTheDocument()
  })

  it('renders sections in correct order', async () => {
    const jsx = await MediaPage({
      params: Promise.resolve({ mediaType: 'movie', id: '278' }),
    })
    const { container } = render(jsx)

    const testIds = Array.from(container.querySelectorAll('[data-testid]')).map(
      (el) => el.getAttribute('data-testid')
    )

    const expectedOrder = [
      'media-hero',
      'synopsis',
      'crew',
      'photos',
      'cast',
      'trailers-section',
      'similar-section',
      'recommended-section',
    ]

    let lastIndex = -1
    for (const testId of expectedOrder) {
      const idx = testIds.indexOf(testId)
      expect(idx).toBeGreaterThan(lastIndex)
      lastIndex = idx
    }
  })
})
