'use client'

import * as Sentry from '@sentry/nextjs'
import { Button, Typography } from '@vite-mf-monorepo/ui'
import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({
  error,
  reset,
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div className="mda:flex mda:flex-col mda:items-center mda:gap-4 mda:py-20">
          <Typography variant="h2">Something went wrong</Typography>
          <Typography variant="body">{error.message}</Typography>
          <Button
            onClick={() => {
              reset()
            }}
          >
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}
