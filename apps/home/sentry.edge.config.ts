import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? 'development',
  sendDefaultPii: true,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
})
