import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ErrorPage from './error'

describe('ErrorPage', () => {
  it('renders the error message', () => {
    const error = new Error('Something failed')
    const noop = vi.fn()
    render(<ErrorPage error={error} reset={noop} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Something failed')).toBeInTheDocument()
  })

  it('renders a try again button', () => {
    const error = new Error('Oops')
    const noop = vi.fn()
    render(<ErrorPage error={error} reset={noop} />)

    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument()
  })

  it('calls reset when try again button is clicked', async () => {
    const user = userEvent.setup()
    const reset = vi.fn()
    const error = new Error('Oops')
    render(<ErrorPage error={error} reset={reset} />)

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(reset).toHaveBeenCalledOnce()
  })
})
