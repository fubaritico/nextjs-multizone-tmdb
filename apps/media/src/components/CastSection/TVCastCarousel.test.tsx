import { describe, it, vi } from 'vitest'

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

// TODO: TVCastCarousel MSW tests are pending until @vite-mf-monorepo/shared/mocks
// publishes tvSeriesCreditsHandlers and mockTVSeriesCredits.
// See CLAUDE.md "Known Issues" — TV mock data gaps.
describe('TVCastCarousel', () => {
  it.todo(
    'renders cast member names from mock TV data (blocked: tvSeriesCreditsHandlers missing)'
  )
  it.todo(
    'renders character names for TV cast members (blocked: tvSeriesCreditsHandlers missing)'
  )
  it.todo(
    'renders links to actor pages for TV cast (blocked: tvSeriesCreditsHandlers missing)'
  )
  it.todo(
    'renders loading state while fetching TV credits (blocked: tvSeriesCreditsHandlers missing)'
  )
  it.todo('renders nothing on error (blocked: tvSeriesCreditsHandlers missing)')
})
