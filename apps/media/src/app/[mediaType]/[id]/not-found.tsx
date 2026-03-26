import { Typography } from '@vite-mf-monorepo/ui'
import Link from 'next/link'

/**
 * Route-level not-found page for the media detail route.
 *
 * Triggered by an explicit `notFound()` call in `page.tsx` when the
 * media type is invalid or TMDB returns a 404.
 */
export default function MediaNotFound() {
  return (
    <div className="mda:flex mda:flex-col mda:items-center mda:gap-4 mda:py-20">
      <Typography variant="h2">Media not found</Typography>
      <Link
        href="/"
        className="mda:inline-flex mda:items-center mda:justify-center mda:rounded-md mda:bg-primary mda:px-4 mda:py-2 mda:font-medium mda:text-primary-foreground mda:hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  )
}
