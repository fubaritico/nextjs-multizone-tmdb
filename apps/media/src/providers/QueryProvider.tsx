'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import { CACHE_TIME_MS } from '../types/media'

import type { ReactNode } from 'react'

/**
 * Media zone React Query provider.
 *
 * Wraps children with a `QueryClientProvider` backed by a per-render
 * `QueryClient` instance. Using `useState` with an initializer function
 * is mandatory — a module-level `QueryClient` would be shared across
 * requests on the server, causing cache leaks between users.
 *
 * @param children - React subtree that needs access to the query cache.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: CACHE_TIME_MS },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
