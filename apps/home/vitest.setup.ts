import '@testing-library/jest-dom/vitest'
import { setupBrowserMocks } from '@vite-mf-monorepo/shared/mocks'
import { createElement } from 'react'
import { vi } from 'vitest'

setupBrowserMocks()

/**
 * Mock react-router-dom globally — @vite-mf-monorepo/ui components (MovieCard)
 * import Link from react-router-dom which requires Router context.
 * Until the UI package is migrated to next/link, we stub it with a plain <a>.
 */
vi.mock('react-router-dom', () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string
    children: React.ReactNode
    [key: string]: unknown
  }) => createElement('a', { href: to, ...props }, children),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
}))
