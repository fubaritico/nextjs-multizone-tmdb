import { Typography } from '@vite-mf-monorepo/ui'
import Link from 'next/link'

/** Not-found page for the media zone. */
export default function NotFound() {
  return (
    <div className="mda:flex mda:flex-col mda:items-center mda:gap-4 mda:py-20">
      <Typography variant="h2">Page not found</Typography>
      <Link
        href="/"
        className="mda:inline-flex mda:items-center mda:justify-center mda:rounded-md mda:bg-primary mda:px-4 mda:py-2 mda:font-medium mda:text-primary-foreground mda:hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  )
}
