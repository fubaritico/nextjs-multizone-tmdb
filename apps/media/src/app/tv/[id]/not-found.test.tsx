import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import TVNotFound from './not-found'

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

describe('TVNotFound', () => {
  it('renders the not-found heading', () => {
    render(<TVNotFound />)

    expect(screen.getByText('TV series not found')).toBeInTheDocument()
  })

  it('renders a link back to home', () => {
    render(<TVNotFound />)

    const link = screen.getByRole('link', { name: /back to home/i })

    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
