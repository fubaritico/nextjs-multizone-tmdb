import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import NotFound from './not-found'

describe('NotFound', () => {
  it('renders the 404 message', () => {
    render(<NotFound />)

    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('renders a link back to home', () => {
    render(<NotFound />)

    const link = screen.getByRole('link', { name: /back to home/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
