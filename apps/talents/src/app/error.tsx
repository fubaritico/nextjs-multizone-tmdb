'use client'

import * as Sentry from '@sentry/nextjs'
import { Button, Typography } from '@vite-mf-monorepo/ui'
import { useEffect } from 'react'

/** Props for the error boundary. */
interface ErrorPageProps {
  /** The error that was thrown. */
  error: Error & { digest?: string }
  /** Callback to retry rendering the failed segment. */
  reset: () => void
}

export default function ErrorPage({ error, reset }: Readonly<ErrorPageProps>) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="tl:flex tl:flex-col tl:items-center tl:gap-4 tl:py-20">
      <Typography variant="h2">Something went wrong</Typography>
      <Typography variant="body">{error.message}</Typography>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
