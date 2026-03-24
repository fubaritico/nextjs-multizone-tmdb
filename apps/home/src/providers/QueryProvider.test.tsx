import { useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import QueryProvider from './QueryProvider'

/** Minimal consumer that asserts it can call useQuery inside the provider. */
function Consumer() {
  const { status } = useQuery({ queryKey: ['test'], queryFn: () => 'ok' })
  return <div>{status}</div>
}

describe('QueryProvider', () => {
  it('renders children inside a QueryClientProvider', () => {
    render(
      <QueryProvider>
        <div>child content</div>
      </QueryProvider>
    )
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('allows useQuery to be called by descendant components', () => {
    render(
      <QueryProvider>
        <Consumer />
      </QueryProvider>
    )
    // useQuery status is either 'pending' or 'success' — either way no throw
    expect(screen.getByText(/pending|success/)).toBeInTheDocument()
  })
})
