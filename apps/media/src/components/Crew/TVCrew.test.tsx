// TODO: MSW tests skipped — tvSeriesCreditsHandlers not available in
// @vite-mf-monorepo/shared/mocks. Enable once upstream publishes TV credits handlers.

import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import TVCrew from './TVCrew'

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

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQuery: vi.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    }),
  }
})

describe('TVCrew', () => {
  it('returns null when no crew data is available', () => {
    const { container } = render(<TVCrew id={549} />)

    expect(container.firstChild).toBeNull()
  })
})
