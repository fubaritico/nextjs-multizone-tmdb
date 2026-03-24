'use client'

import { Button, Typography } from '@vite-mf-monorepo/ui'

/** Props for the error boundary. */
interface ErrorPageProps {
  /** The error that was thrown. */
  error: Error & { digest?: string }
  /** Callback to retry rendering the failed segment. */
  reset: () => void
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  return (
    <div className="sr:flex sr:flex-col sr:items-center sr:gap-4 sr:py-20">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="body">{error.message}</Typography>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
