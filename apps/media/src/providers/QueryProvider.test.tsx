import { useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import QueryProvider from './QueryProvider'

/**
 * Minimal consumer that confirms it can read from the QueryClient provided
 * by QueryProvider without throwing.
 */
function Consumer() {
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: () => 'hello',
    initialData: 'hello',
  })
  return <span>{data}</span>
}

describe('QueryProvider', () => {
  it('renders children inside a QueryClientProvider', () => {
    render(
      <QueryProvider>
        <Consumer />
      </QueryProvider>
    )

    expect(screen.getByText('hello')).toBeInTheDocument()
  })
})
