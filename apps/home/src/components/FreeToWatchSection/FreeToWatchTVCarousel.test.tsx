import { screen, waitFor } from '@testing-library/react'
import {
  freeToWatchHandlers,
  mockFreeToWatchTV,
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

import FreeToWatchTVCarousel from './FreeToWatchTVCarousel'

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

const shows = mockFreeToWatchTV.results ?? []
const firstShow = shows[0]

describe('FreeToWatchTVCarousel', () => {
  it('renders free-to-watch TV show names', async () => {
    server.use(freeToWatchHandlers.freeToWatchTV)

    renderWithReactQuery(<FreeToWatchTVCarousel />)

    await waitFor(() => {
      expect(screen.getByText(firstShow.name ?? 'Unknown')).toBeInTheDocument()
    })
  })

  it('renders links to TV detail pages', async () => {
    server.use(freeToWatchHandlers.freeToWatchTV)

    renderWithReactQuery(<FreeToWatchTVCarousel />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', `/tv/${String(firstShow.id)}`)
    })
  })
})
