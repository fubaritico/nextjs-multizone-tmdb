import { Typography } from '@vite-mf-monorepo/ui'
import Link from 'next/link'

/**
 * Route-level not-found page for the TV series detail route.
 *
 * Triggered by an explicit `notFound()` call in `page.tsx` when TMDB
 * returns a 404 or empty response for the requested TV series ID.
 */
export default function TVNotFound() {
  return (
    <div className="mda:flex mda:flex-col mda:items-center mda:gap-4 mda:py-20">
      <Typography variant="h2">TV series not found</Typography>
      <Link
        href="/"
        className="mda:inline-flex mda:items-center mda:justify-center mda:rounded-md mda:bg-primary mda:px-4 mda:py-2 mda:font-medium mda:text-primary-foreground mda:hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  )
}
