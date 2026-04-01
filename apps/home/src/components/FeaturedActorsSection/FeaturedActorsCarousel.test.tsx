import { screen, waitFor } from '@testing-library/react'
import { renderWithReactQuery } from '@vite-mf-monorepo/shared/test-utils'
import { HttpResponse, http } from 'msw'
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

import FeaturedActorsCarousel from './FeaturedActorsCarousel'

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

const mockActors = {
  results: [
    {
      id: 101,
      name: 'Test Actor',
      known_for_department: 'Acting',
      profile_path: '/test-profile.jpg',
    },
    {
      id: 102,
      name: 'Second Actor',
      known_for_department: 'Acting',
      profile_path: '/second-profile.jpg',
    },
  ],
}

const server = setupServer(
  http.get('*/person/popular*', () => HttpResponse.json(mockActors))
)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})
afterEach(() => {
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('FeaturedActorsCarousel', () => {
  it('renders actor names', async () => {
    renderWithReactQuery(<FeaturedActorsCarousel />)

    await waitFor(() => {
      expect(screen.getByText('Test Actor')).toBeInTheDocument()
    })
  })

  it('shows loading skeleton while fetching', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    server.use(http.get('*/person/popular*', () => new Promise(() => {})))

    renderWithReactQuery(<FeaturedActorsCarousel />)

    expect(screen.getByTestId('carousel-loading')).toBeInTheDocument()
  })

  it('shows error message on fetch failure', async () => {
    server.use(
      http.get('*/person/popular*', () =>
        HttpResponse.json({ status_message: 'Server error' }, { status: 500 })
      )
    )

    renderWithReactQuery(<FeaturedActorsCarousel />)

    await waitFor(() => {
      expect(screen.getByTestId('carousel-error')).toBeInTheDocument()
    })
  })

  it('renders links to actor detail pages', async () => {
    renderWithReactQuery(<FeaturedActorsCarousel />)

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links[0]).toHaveAttribute('href', '/actor/101')
    })
  })
})
