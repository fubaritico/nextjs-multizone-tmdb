import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import MovieNotFound from './not-found'

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

describe('MovieNotFound', () => {
  it('renders the not-found heading', () => {
    render(<MovieNotFound />)

    expect(screen.getByText('Movie not found')).toBeInTheDocument()
  })

  it('renders a link back to home', () => {
    render(<MovieNotFound />)

    const link = screen.getByRole('link', { name: /back to home/i })

    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
