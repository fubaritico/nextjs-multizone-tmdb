import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import MovieErrorPage from './error'

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
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}))

describe('MovieErrorPage', () => {
  it('renders the error heading', () => {
    const error = new Error('Something failed')
    const reset = vi.fn()

    render(<MovieErrorPage error={error} reset={reset} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders the error message', () => {
    const error = new Error('Network timeout')
    const reset = vi.fn()

    render(<MovieErrorPage error={error} reset={reset} />)

    expect(screen.getByText('Network timeout')).toBeInTheDocument()
  })

  it('renders a Try again button', () => {
    const error = new Error('Failed')
    const reset = vi.fn()

    render(<MovieErrorPage error={error} reset={reset} />)

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument()
  })

  it('calls reset when Try again is clicked', async () => {
    const user = userEvent.setup()
    const error = new Error('Failed')
    const reset = vi.fn()

    render(<MovieErrorPage error={error} reset={reset} />)

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(reset).toHaveBeenCalledOnce()
  })
})
