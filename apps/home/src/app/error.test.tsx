import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import ErrorPage from './error'

describe('ErrorPage', () => {
  it('renders the error message', () => {
    const error = new Error('Something exploded')
    render(<ErrorPage error={error} reset={vi.fn()} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Something exploded')).toBeInTheDocument()
  })

  it('renders a Try again button', () => {
    render(<ErrorPage error={new Error('oops')} reset={vi.fn()} />)
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument()
  })

  it('calls reset when the button is clicked', async () => {
    const reset = vi.fn()
    render(<ErrorPage error={new Error('oops')} reset={reset} />)
    await userEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(reset).toHaveBeenCalledOnce()
  })
})
