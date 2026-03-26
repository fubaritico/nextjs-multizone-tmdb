'use client'

import { Button, Typography } from '@vite-mf-monorepo/ui'

/** Props for the media detail error boundary. */
interface ErrorPageProps {
  /** The error that was thrown. */
  error: Error & { digest?: string }
  /** Callback to retry rendering the failed segment. */
  reset: () => void
}

/**
 * Route-level error boundary for the media detail page.
 *
 * Scoped to `[mediaType]/[id]` — will NOT catch errors in the root layout.
 * Renders an error message and a "Try again" button that calls `reset`
 * to re-render the failed segment.
 */
export default function MediaErrorPage({
  error,
  reset,
}: Readonly<ErrorPageProps>) {
  return (
    <div className="mda:flex mda:flex-col mda:items-center mda:gap-4 mda:py-20">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="body">{error.message}</Typography>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
