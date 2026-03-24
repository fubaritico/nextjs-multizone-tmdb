'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

import type { ReactNode } from 'react'

/**
 * Provides TanStack Query context to the search zone.
 * Uses a stable QueryClient instance via useState initializer.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
