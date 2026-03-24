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
    <div className="hm:flex hm:flex-col hm:items-center hm:gap-4 hm:py-20">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="body">{error.message}</Typography>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
