import { Typography } from '@vite-mf-monorepo/ui'
import Link from 'next/link'

/** Not-found page for the home zone. */
export default function NotFound() {
  return (
    <div className="hm:flex hm:flex-col hm:items-center hm:gap-4 hm:py-20">
      <Typography variant="h2">Page not found</Typography>
      <Link
        href="/"
        className="hm:inline-flex hm:items-center hm:justify-center hm:rounded-md hm:bg-primary hm:px-4 hm:py-2 hm:font-medium hm:text-primary-foreground hm:hover:bg-primary/90"
      >
        Back to home
      </Link>
    </div>
  )
}
