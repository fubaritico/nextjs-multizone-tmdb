'use client'

import { Button, Typography } from '@vite-mf-monorepo/ui'

/** Props for the director detail error boundary. */
interface ErrorPageProps {
  /** The error that was thrown. */
  error: Error & { digest?: string }
  /** Callback to retry rendering the failed segment. */
  reset: () => void
}

/**
 * Error boundary for director detail pages.
 * Displays the error message and provides a reset action.
 */
export default function DirectorErrorPage({
  error,
  reset,
}: Readonly<ErrorPageProps>) {
  return (
    <div className="tl:flex tl:flex-col tl:items-center tl:gap-4 tl:py-20">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="body">{error.message}</Typography>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
