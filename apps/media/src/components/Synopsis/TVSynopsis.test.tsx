import { screen, waitFor } from '@testing-library/react'
import {
  mockTVSeriesDetails,
  tvSeriesDetailsHandlers,
} from '@vite-mf-monorepo/shared/mocks'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { setupServer } from 'msw/node'
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import TVSynopsis from './TVSynopsis'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    <img {...props} />
  ),
}))

const server = setupServer()

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const SERIES_ID = mockTVSeriesDetails.id ?? 549

describe('TVSynopsis', () => {
  it('renders the section heading', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    renderWithReactQuery(<TVSynopsis id={SERIES_ID} />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Synopsis' })
      ).toBeInTheDocument()
    })
  })

  it('renders the TV series overview text', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    renderWithReactQuery(<TVSynopsis id={SERIES_ID} />)

    await waitFor(() => {
      expect(
        screen.getByText(mockTVSeriesDetails.overview ?? '')
      ).toBeInTheDocument()
    })
  })

  it('renders with data-testid="synopsis"', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetails)

    renderWithReactQuery(<TVSynopsis id={SERIES_ID} />)

    await waitFor(() => {
      expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    })
  })

  it('renders loading skeletons while fetching', () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetailsLoading)

    renderWithReactQuery(<TVSynopsis id={SERIES_ID} />)

    expect(screen.getByTestId('synopsis')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Synopsis' })
    ).toBeInTheDocument()
  })

  it('returns null on error', async () => {
    server.use(tvSeriesDetailsHandlers.tvSeriesDetailsError)

    const { container } = renderWithReactQuery(<TVSynopsis id={SERIES_ID} />)

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })
})
