'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import type { ReactNode } from 'react'

/** Props for the QueryProvider component. */
interface QueryProviderProps {
  /** Child components to be wrapped by the query client provider. */
  children: ReactNode
}

/**
 * Client-side QueryProvider that initializes TanStack Query for the talents zone.
 * Uses a lazy initializer to ensure the QueryClient is only created once per mount.
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
