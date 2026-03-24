import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  mockTrendingDay,
  trendingHandlers,
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

import TrendingSection from './TrendingSection'

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

const firstDayTitle = (mockTrendingDay.results ?? [])[0].title ?? ''

describe('TrendingSection', () => {
  it('renders the "Trending" heading', () => {
    server.use(trendingHandlers.trendingDay, trendingHandlers.trendingWeek)

    renderWithReactQuery(<TrendingSection />)

    expect(screen.getByText('Trending')).toBeInTheDocument()
  })

  it('renders "Today" and "This Week" tabs', () => {
    server.use(trendingHandlers.trendingDay, trendingHandlers.trendingWeek)

    renderWithReactQuery(<TrendingSection />)

    expect(screen.getByRole('tab', { name: /today/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /this week/i })).toBeInTheDocument()
  })

  it('shows trending day content by default', async () => {
    server.use(trendingHandlers.trendingDay, trendingHandlers.trendingWeek)

    renderWithReactQuery(<TrendingSection />)

    await waitFor(() => {
      expect(screen.getByText(firstDayTitle)).toBeInTheDocument()
    })
  })

  it('switches to "This Week" tab on click', async () => {
    const user = userEvent.setup()
    server.use(trendingHandlers.trendingDay, trendingHandlers.trendingWeek)

    renderWithReactQuery(<TrendingSection />)

    await user.click(screen.getByRole('tab', { name: /this week/i }))

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /this week/i })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })
  })
})
